import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    jobsApi,
    jobSheetsApi,
    type Job,
    type JobSheet
} from '@/services/api/jobs';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MapPin, Play, CheckCircle, Package, ArrowLeft, Building } from 'lucide-react';

export function JobExecution() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState<Job | null>(null);
    const [jobSheet, setJobSheet] = useState<JobSheet | null>(null);
    const [loading, setLoading] = useState(true);

    // Job Sheet Form Data
    const [workDescription, setWorkDescription] = useState('');
    const [meterMono, setMeterMono] = useState<number>(0);
    const [meterColor, setMeterColor] = useState<number>(0);
    const [customerName, setCustomerName] = useState('');
    const [signature, setSignature] = useState(''); // Text for now

    // Parts usage (local state for UI, separate API calls usually)
    const [parts, setParts] = useState<{ name: string, qty: number }[]>([]);
    const [newPartName, setNewPartName] = useState('');
    const [newPartQty, setNewPartQty] = useState(1);

    useEffect(() => {
        if (id) loadData(id);
    }, [id]);

    const loadData = async (jobId: string) => {
        try {
            setLoading(true);
            const jobData = await jobsApi.getById(jobId);
            setJob(jobData);

            // Check for existing job sheet
            try {
                const sheet = await jobSheetsApi.getByJobId(jobId);
                setJobSheet(sheet);
                if (sheet) {
                    setWorkDescription(sheet.work_description || '');
                    setMeterMono(sheet.final_meter_mono || 0);
                    setMeterColor(sheet.final_meter_color || 0);
                }
            } catch (e) {
                // No sheet yet
                setJobSheet(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartJob = async () => {
        if (!job || !user) return;
        try {
            await jobsApi.start(job.id);
            // Create initial job sheet
            const sheet = await jobSheetsApi.create({
                job_id: job.id,
                technician_id: user.id,
                work_description: '',
                arrival_time: new Date().toISOString(),
                initial_meter_mono: 0, // Should fetch from machine
                initial_meter_color: 0
            });
            setJobSheet(sheet);
            loadData(job.id); // Refresh
        } catch (e) {
            console.error(e);
            alert('Error starting job');
        }
    };

    const handleCompleteJob = async () => {
        if (!job || !jobSheet) return;
        try {
            // 1. Update Job Sheet Details
            await jobSheetsApi.update(jobSheet.id, {
                work_description: workDescription,
                final_meter_mono: meterMono,
                final_meter_color: meterColor,
            });

            // 2. Add Parts (Loop)
            for (const part of parts) {
                await jobSheetsApi.addPart(jobSheet.id, part.name, part.qty);
            }

            // 3. Submit Sheet (Sign)
            await jobSheetsApi.submit(jobSheet.id, customerName, signature);

            // 4. Complete Job Status
            await jobsApi.complete(job.id);

            navigate('/technician/jobs');
        } catch (e) {
            console.error(e);
            alert('Error completing job');
        }
    };

    const addPart = () => {
        if (!newPartName) return;
        setParts([...parts, { name: newPartName, qty: newPartQty }]);
        setNewPartName('');
        setNewPartQty(1);
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (!job) return <div className="p-4">Job not found</div>;

    return (
        <div className="max-w-md mx-auto space-y-4 pb-20">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/technician/jobs')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold">Job Execution</h1>
            </div>

            {/* Job Info Card */}
            <Card>
                <CardHeader className="bg-gray-50 pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg">{job.job_number}</CardTitle>
                            <Badge className={getStatusColor(job.status)}>{getStatusLabel(job.status)}</Badge>
                        </div>
                        <Badge variant="outline" className="capitalize">{(job.type || '').replace('_', ' ')}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                        <Building className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                            <div className="font-semibold">{(job as any).customers?.company_name}</div>
                            <p className="text-sm text-gray-500">{(job as any).sites?.name}</p>
                            <p className="text-xs text-gray-400">{(job as any).sites?.address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <span className="text-sm">{(job as any).sites?.address || 'No address'}</span>
                    </div>

                    {/* Machine Info */}
                    {(job as any).machines && (
                        <div className="bg-blue-50 p-3 rounded-lg text-sm border border-blue-100">
                            <span className="font-semibold text-blue-900">Machine: </span>
                            {(job as any).machines.products?.model} ({(job as any).machines.serial_number})
                        </div>
                    )}

                    <div className="bg-yellow-50 p-3 rounded-lg text-sm border border-yellow-100">
                        <span className="font-semibold text-yellow-900">Task: </span>
                        {job.description}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            {job.status === 'assigned' && (
                <Button className="w-full h-12 text-lg" onClick={handleStartJob}>
                    <Play className="w-5 h-5 mr-2" /> Start Job
                </Button>
            )}

            {job.status === 'in_progress' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Service Report</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Work Description</Label>
                                <Textarea
                                    placeholder="What was done..."
                                    value={workDescription}
                                    onChange={e => setWorkDescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Meter Readings</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500">Total Black</label>
                                        <Input type="number" value={meterMono} onChange={e => setMeterMono(Number(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Total Color</label>
                                        <Input type="number" value={meterColor} onChange={e => setMeterColor(Number(e.target.value))} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Spare Parts</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="Part Name" value={newPartName} onChange={e => setNewPartName(e.target.value)} className="flex-1" />
                                    <Input type="number" placeholder="Qty" value={newPartQty} onChange={e => setNewPartQty(Number(e.target.value))} className="w-20" />
                                    <Button size="icon" variant="outline" onClick={addPart}><Package className="w-4 h-4" /></Button>
                                </div>
                                <div className="space-y-1 mt-2">
                                    {parts.map((p, i) => (
                                        <div key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                            <span>{p.name}</span>
                                            <Badge variant="secondary">x{p.qty}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Completion</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Customer Name</Label>
                                <Input placeholder="Signee Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Signature</Label>
                                <div className="border border-dashed border-gray-300 rounded-md p-8 text-center text-gray-400 bg-gray-50">
                                    [Signature Canvas Placeholder]
                                </div>
                                <Input placeholder="Type signature if canvas unavailable" value={signature} onChange={e => setSignature(e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCompleteJob}>
                                <CheckCircle className="w-5 h-5 mr-2" /> Complete Job
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {job.status === 'completed' && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-green-800">Job Completed</h3>
                        <p className="text-green-700">Thank you for your hard work!</p>
                        <Button variant="outline" className="mt-4" onClick={() => navigate('/technician/jobs')}>
                            Back to Jobs
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
