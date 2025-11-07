import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarmData } from '@/contexts/FarmDataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/Breadcrumb';
import { EmptyState } from '@/components/EmptyState';

const Reports = () => {
  const navigate = useNavigate();
  const { cows, milkRecords, feedRecords, healthRecords } = useFarmData();
  const [selectedCowId, setSelectedCowId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const isAllCows = selectedCowId === 'all';

  // Filter records for selected cow and date
  const selectedCow = cows.find(c => c.id === selectedCowId);
  const todayMilk = milkRecords.filter(r => 
    (isAllCows || r.cowId === selectedCowId) && r.date === selectedDate
  );
  const todayFeed = feedRecords.filter(r => 
    (isAllCows || r.cowId === selectedCowId) && r.date === selectedDate
  );
  const todayHealth = healthRecords.filter(r => 
    (isAllCows || r.cowId === selectedCowId) && r.date === selectedDate
  );

  const totalMilkToday = todayMilk.reduce((sum, r) => sum + r.totalLitres, 0);
  const totalFeedToday = todayFeed.reduce((sum, r) => sum + r.quantity, 0);

  // For "All Cows" view, group data by cow
  const cowReports = isAllCows ? cows.map(cow => {
    const cowMilk = milkRecords.filter(r => r.cowId === cow.id && r.date === selectedDate);
    const cowFeed = feedRecords.filter(r => r.cowId === cow.id && r.date === selectedDate);
    const cowHealth = healthRecords.filter(r => r.cowId === cow.id && r.date === selectedDate);
    
    return {
      cow,
      milk: cowMilk.reduce((sum, r) => sum + r.totalLitres, 0),
      milkDetails: cowMilk[0],
      feed: cowFeed.reduce((sum, r) => sum + r.quantity, 0),
      feedDetails: cowFeed,
      health: cowHealth[0],
    };
  }) : [];

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb />
        
        <header className="mb-6 animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Daily Report</h1>
          <p className="text-muted-foreground">View daily summary for any cow</p>
        </header>

        <Card className="p-6 mb-6 animate-fade-in-up">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cow-select" className="text-base mb-2 block">Cow</Label>
              <Select value={selectedCowId} onValueChange={setSelectedCowId}>
                <SelectTrigger id="cow-select" className="h-11">
                  <SelectValue placeholder="Choose a cow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="font-semibold">All Cows</span>
                  </SelectItem>
                  {cows.map(cow => (
                    <SelectItem key={cow.id} value={cow.id}>
                      {cow.name} ({cow.breed})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-select" className="text-base mb-2 block">Date</Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
        </Card>

        {isAllCows ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">All Cows Report</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Production</p>
                <p className="text-2xl font-bold text-primary">{totalMilkToday.toFixed(1)}L</p>
              </div>
            </div>

            <div className="grid gap-3">
              {cowReports.map((report, idx) => (
                <Card 
                  key={report.cow.id} 
                  className="p-4 hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'backwards' }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div>
                        <h3 className="font-bold text-foreground">{report.cow.name}</h3>
                        <p className="text-xs text-muted-foreground">{report.cow.breed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-sm font-semibold capitalize">{report.cow.status}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Milk</p>
                        <p className="text-lg font-bold text-primary">{report.milk.toFixed(1)}L</p>
                        {report.milkDetails && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <p>M: {report.milkDetails.morningLitres}L</p>
                            <p>N: {report.milkDetails.noonLitres}L</p>
                            <p>E: {report.milkDetails.eveningLitres}L</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Feed</p>
                        <p className="text-lg font-bold text-accent">{report.feed.toFixed(1)} kg</p>
                        {report.feedDetails.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {report.feedDetails.map((f, i) => (
                              <p key={i}>{f.feedType}: {f.quantity}{f.unit}</p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Health</p>
                        {report.health ? (
                          <div>
                            <p className="text-sm font-bold capitalize">{report.health.healthStatus}</p>
                            {report.health.illness && (
                              <p className="text-xs text-muted-foreground mt-1">{report.health.illness}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No records</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {cowReports.length === 0 && (
              <EmptyState
                icon={FileText}
                title="No data for this date"
                description="No records found for any cows on this date."
              />
            )}
          </div>
        ) : !selectedCow ? (
          <EmptyState
            icon={FileText}
            title="Select a cow to view report"
            description="Choose a cow and date to see daily metrics"
          />
        ) : (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedCow.name}</h2>
                <p className="text-sm text-muted-foreground">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="p-5 hover-lift">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Milk Production</p>
                    <p className="text-3xl font-bold text-primary">{totalMilkToday.toFixed(1)}L</p>
                  </div>
                  {todayMilk.length > 0 && (
                    <div className="text-right text-xs text-muted-foreground space-y-1">
                      <p>Morning: <span className="font-semibold">{todayMilk[0].morningLitres}L</span></p>
                      <p>Noon: <span className="font-semibold">{todayMilk[0].noonLitres}L</span></p>
                      <p>Evening: <span className="font-semibold">{todayMilk[0].eveningLitres}L</span></p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-5 hover-lift">
                <p className="text-sm text-muted-foreground mb-1">Feed Given</p>
                <p className="text-3xl font-bold text-accent">{totalFeedToday.toFixed(1)} kg</p>
                {todayFeed.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {todayFeed.map((feed, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                        <span>{feed.feedType}</span>
                        <span className="font-semibold">{feed.quantity} {feed.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-5 hover-lift">
                <p className="text-sm text-muted-foreground mb-1">Health Status</p>
                {todayHealth.length > 0 ? (
                  <div>
                    <p className="text-2xl font-bold text-foreground capitalize mb-2">{todayHealth[0].healthStatus}</p>
                    {todayHealth[0].illness && (
                      <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Issue:</span> {todayHealth[0].illness}</p>
                    )}
                    {todayHealth[0].attendedBy && (
                      <p className="text-xs text-muted-foreground"><span className="font-medium">Attended by:</span> {todayHealth[0].attendedBy}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-lg text-muted-foreground">No health records</p>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
