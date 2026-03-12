import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { jobsApi, type Job } from '@/services/api/jobs';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, CheckCircle, Clock, ArrowRight, Building, Calendar, QrCode } from 'lucide-react';

export function TechnicianJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMyJobs();
  }, [user]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      // If admin, maybe fetch all? But this page is "TechnicianJobs".
      // If user.role is technician, fetch assigned.
      if (user?.id) {
        const data = await jobsApi.getByTechnician(user.id);
        setJobs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingJobs = jobs.filter(job => job.status === 'assigned' || job.status === 'pending');
  const inProgressJobs = jobs.filter(job => job.status === 'in_progress');
  const completedJobs = jobs.filter(job => job.status === 'completed');

  const JobCard = ({ job }: { job: Job }) => {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/technician/jobs/${job.id}`)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{job.job_number}</h3>
                  <Badge className={getStatusColor(job.status)}>
                    {getStatusLabel(job.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{job.description}</p>

                <div className="mt-3 space-y-1">
                  {(job as any).customers && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Building className="w-4 h-4" />
                      {(job as any).customers.company_name}
                    </div>
                  )}
                  {job.scheduled_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(job.scheduled_date)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) return <div className="p-4">Loading your jobs...</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500">Job Assignments</p>
        </div>
        <Button onClick={() => navigate('/technician/scan')} variant="outline">
          <QrCode className="w-4 h-4 mr-2" />
          Scan QR Code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-xs text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{pendingJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-blue-700">In Progress</p>
                <p className="text-2xl font-bold text-blue-800">{inProgressJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-800">{completedJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Lists */}
      <Tabs defaultValue="pending">
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1">
            Pending ({pendingJobs.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="flex-1">
            In Progress ({inProgressJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p>No pending jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="mt-4">
          {inProgressJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No active jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgressJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No completed jobs </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
