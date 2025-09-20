import {
    AlertTriangle,
    Calendar as CalendarIcon,
    Clock,
    CreditCard,
    DollarSign,
    Plus,
    School,
    Stethoscope
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/common/button'
import { Calendar } from '../../../components/common/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/common/dialog'

interface Subscription {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: 'school' | 'doctor'
  plan: 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  startDate: string
  endDate: string
  amount: number
  currency: string
  childrenLimit: number
  currentChildren: number
  autoRenew: boolean
}

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    userId: 'school1',
    userName: 'ABC Elementary School',
    userEmail: 'admin@abcelementary.edu',
    type: 'school',
    plan: 'premium',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    amount: 299.99,
    currency: 'USD',
    childrenLimit: 50,
    currentChildren: 35,
    autoRenew: true
  },
  {
    id: '2',
    userId: 'doctor1',
    userName: 'Dr. Sarah Wilson',
    userEmail: 'dr.wilson@clinic.com',
    type: 'doctor',
    plan: 'basic',
    status: 'active',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-04-15T23:59:59Z',
    amount: 99.99,
    currency: 'USD',
    childrenLimit: 5,
    currentChildren: 3,
    autoRenew: false
  },
  {
    id: '3',
    userId: 'school2',
    userName: 'Riverside Middle School',
    userEmail: 'principal@riverside.edu',
    type: 'school',
    plan: 'enterprise',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    amount: 599.99,
    currency: 'USD',
    childrenLimit: 100,
    currentChildren: 78,
    autoRenew: true
  },
  {
    id: '4',
    userId: 'doctor2',
    userName: 'Dr. Michael Chen',
    userEmail: 'dr.chen@neurology.com',
    type: 'doctor',
    plan: 'premium',
    status: 'expired',
    startDate: '2023-10-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    amount: 149.99,
    currency: 'USD',
    childrenLimit: 10,
    currentChildren: 8,
    autoRenew: false
  },
  {
    id: '5',
    userId: 'school3',
    userName: 'Sunshine Elementary School',
    userEmail: 'admin@sunshine.edu',
    type: 'school',
    plan: 'basic',
    status: 'pending',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-05-01T23:59:59Z',
    amount: 199.99,
    currency: 'USD',
    childrenLimit: 25,
    currentChildren: 0,
    autoRenew: false
  }
]

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions)
  const [selectedType, setSelectedType] = useState<'all' | 'school' | 'doctor'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'expired' | 'cancelled' | 'pending'>('all')
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const filteredSubscriptions = subscriptions.filter(sub => {
    const typeMatch = selectedType === 'all' || sub.type === selectedType
    const statusMatch = selectedStatus === 'all' || sub.status === selectedStatus
    return typeMatch && statusMatch
  })

  const handleExtendSubscription = (subscriptionId: string, months: number) => {
    setSubscriptions(prev => 
      prev.map(sub => {
        if (sub.id === subscriptionId) {
          const currentEndDate = new Date(sub.endDate)
          const newEndDate = new Date(currentEndDate)
          newEndDate.setMonth(newEndDate.getMonth() + months)
          
          return {
            ...sub,
            endDate: newEndDate.toISOString(),
            status: 'active' as const
          }
        }
        return sub
      })
    )
  }

  const openExtendDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setSelectedDate(undefined)
    setIsExtendDialogOpen(true)
  }

  const handleExtendWithCustomDate = () => {
    if (selectedSubscription && selectedDate) {
      setSubscriptions(prev => 
        prev.map(sub => {
          if (sub.id === selectedSubscription.id) {
            return {
              ...sub,
              endDate: selectedDate.toISOString(),
              status: 'active' as const
            }
          }
          return sub
        })
      )
      setIsExtendDialogOpen(false)
      setSelectedSubscription(null)
      setSelectedDate(undefined)
    }
  }

  const closeExtendDialog = () => {
    setIsExtendDialogOpen(false)
    setSelectedSubscription(null)
    setSelectedDate(undefined)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'expired': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'school': return <School className="h-5 w-5" />
      case 'doctor': return <Stethoscope className="h-5 w-5" />
      default: return <CreditCard className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'school': return 'bg-green-100 text-green-600'
      case 'doctor': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-600'
      case 'premium': return 'bg-purple-100 text-purple-600'
      case 'enterprise': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
        <div className="flex space-x-2">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All Types
          </Button>
          <Button
            variant={selectedType === 'school' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('school')}
          >
            Schools
          </Button>
          <Button
            variant={selectedType === 'doctor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('doctor')}
          >
            Doctors
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <Button
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('all')}
        >
          All Status
        </Button>
        <Button
          variant={selectedStatus === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('active')}
        >
          Active
        </Button>
        <Button
          variant={selectedStatus === 'expired' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('expired')}
        >
          Expired
        </Button>
        <Button
          variant={selectedStatus === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedStatus('pending')}
        >
          Pending
        </Button>
      </div>

      <div className="space-y-4">
        {filteredSubscriptions.map((subscription) => {
          const daysUntilExpiry = getDaysUntilExpiry(subscription.endDate)
          const usagePercentage = getUsagePercentage(subscription.currentChildren, subscription.childrenLimit)
          const isNearExpiry = daysUntilExpiry <= 30 && subscription.status === 'active'
          
          return (
            <Card key={subscription.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(subscription.type)}`}>
                      {getTypeIcon(subscription.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{subscription.userName}</CardTitle>
                      <p className="text-sm text-gray-600">{subscription.userEmail}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(subscription.plan)}`}>
                          {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                        {isNearExpiry && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Expires in {daysUntilExpiry} days
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Subscription Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Start Date:</span> {formatDate(subscription.startDate)}</p>
                      <p><span className="font-medium">End Date:</span> {formatDate(subscription.endDate)}</p>
                      <p><span className="font-medium">Auto-renew:</span> {subscription.autoRenew ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Usage</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Children:</span> {subscription.currentChildren} / {subscription.childrenLimit}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            usagePercentage > 80 ? 'bg-red-500' : 
                            usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${usagePercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">{usagePercentage}% used</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                    <div className="space-y-2">
                                             {subscription.status === 'expired' && (
                         <Button 
                           size="sm" 
                           className="w-full"
                           onClick={() => handleExtendSubscription(subscription.id, 3)}
                         >
                           <Plus className="h-4 w-4 mr-2" />
                           Extend 3 Months
                         </Button>
                       )}
                      {isNearExpiry && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full text-orange-600 hover:text-orange-700"
                          onClick={() => handleExtendSubscription(subscription.id, 6)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Extend 6 Months
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                        onClick={() => openExtendDialog(subscription)}
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Extend to Date
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        View Billing
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Extend Subscription Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedSubscription && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Current End Date:</span> {formatDate(selectedSubscription.endDate)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Subscription:</span> {selectedSubscription.userName}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Select New Expiry Date
              </label>
              <div className="border rounded-lg p-4 bg-white">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date <= new Date()}
                  className="w-full"
                  showOutsideDays={false}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={closeExtendDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleExtendWithCustomDate}
              disabled={!selectedDate}
            >
              Extend Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
