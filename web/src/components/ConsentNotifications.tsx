/**
 * Consent Notifications Component
 * Displays consent-related notifications for patients and providers
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Bell,
    BellRing,
    UserCheck,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Eye,
    MarkAsUnread,
    Trash2,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    consentService,
    ConsentNotification,
    ConsentRequest
} from '@/services/consentService';

interface ConsentNotificationsProps {
    userId: string;
    userType: 'patient' | 'provider';
    onNotificationClick?: (notification: ConsentNotification) => void;
    onViewRequest?: (requestId: string) => void;
    className?: string;
}

interface NotificationGroup {
    type: ConsentNotification['type'];
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    notifications: ConsentNotification[];
}

export default function ConsentNotifications({
    userId,
    userType,
    onNotificationClick,
    onViewRequest,
    className
}: ConsentNotificationsProps) {
    const [notifications, setNotifications] = useState<ConsentNotification[]>([]);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load notifications
    const loadNotifications = useCallback(() => {
        setLoading(true);
        try {
            const allNotifications = consentService.getNotifications(userId, userType);
            setNotifications(allNotifications);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, userType]);

    // Load notifications on mount
    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Mark notification as read
    const handleMarkAsRead = useCallback((notificationId: string) => {
        const success = consentService.markNotificationAsRead(notificationId);
        if (success) {
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, isRead: true }
                        : notif
                )
            );
        }
    }, []);

    // Mark all notifications as read
    const handleMarkAllAsRead = useCallback(() => {
        const markedCount = consentService.markAllNotificationsAsRead(userId, userType);
        if (markedCount > 0) {
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true }))
            );
        }
    }, [userId, userType]);

    // Handle notification click
    const handleNotificationClick = useCallback((notification: ConsentNotification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }

        onNotificationClick?.(notification);

        if (notification.actionUrl && onViewRequest) {
            const requestId = notification.consentRequestId;
            onViewRequest(requestId);
        }
    }, [handleMarkAsRead, onNotificationClick, onViewRequest]);

    // Filter notifications
    const filteredNotifications = showUnreadOnly
        ? notifications.filter(notif => !notif.isRead)
        : notifications;

    // Group notifications by type
    const notificationGroups: NotificationGroup[] = [
        {
            type: 'request',
            title: 'New Requests',
            icon: UserCheck,
            color: 'text-blue-600',
            notifications: filteredNotifications.filter(n => n.type === 'request')
        },
        {
            type: 'approval',
            title: 'Approvals',
            icon: CheckCircle,
            color: 'text-green-600',
            notifications: filteredNotifications.filter(n => n.type === 'approval')
        },
        {
            type: 'denial',
            title: 'Denials',
            icon: XCircle,
            color: 'text-red-600',
            notifications: filteredNotifications.filter(n => n.type === 'denial')
        },
        {
            type: 'expiration',
            title: 'Expirations',
            icon: Clock,
            color: 'text-yellow-600',
            notifications: filteredNotifications.filter(n => n.type === 'expiration')
        },
        {
            type: 'revocation',
            title: 'Revocations',
            icon: AlertTriangle,
            color: 'text-orange-600',
            notifications: filteredNotifications.filter(n => n.type === 'revocation')
        }
    ].filter(group => group.notifications.length > 0);

    // Get notification icon
    const getNotificationIcon = useCallback((type: ConsentNotification['type']) => {
        switch (type) {
            case 'request':
                return UserCheck;
            case 'approval':
                return CheckCircle;
            case 'denial':
                return XCircle;
            case 'expiration':
                return Clock;
            case 'revocation':
                return AlertTriangle;
            default:
                return Bell;
        }
    }, []);

    // Get notification color
    const getNotificationColor = useCallback((type: ConsentNotification['type']) => {
        switch (type) {
            case 'request':
                return 'text-blue-600';
            case 'approval':
                return 'text-green-600';
            case 'denial':
                return 'text-red-600';
            case 'expiration':
                return 'text-yellow-600';
            case 'revocation':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    }, []);

    // Format date
    const formatDate = useCallback((dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    }, []);

    // Get unread count
    const unreadCount = notifications.filter(notif => !notif.isRead).length;

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-pulse text-gray-500">Loading notifications...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        {unreadCount > 0 ? (
                            <BellRing className="h-5 w-5 text-blue-600" />
                        ) : (
                            <Bell className="h-5 w-5" />
                        )}
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <Badge className="bg-blue-600">
                                {unreadCount}
                            </Badge>
                        )}
                    </CardTitle>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                        >
                            {showUnreadOnly ? 'Show All' : 'Unread Only'}
                        </Button>

                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                            >
                                Mark All Read
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No notifications</p>
                        <p className="text-sm">
                            {showUnreadOnly
                                ? 'No unread notifications'
                                : 'You\'re all caught up!'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {notificationGroups.map((group, groupIndex) => (
                            <div key={group.type} className="p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <group.icon className={cn("h-4 w-4", group.color)} />
                                    <h4 className="font-medium text-sm">{group.title}</h4>
                                    <Badge variant="outline" className="text-xs">
                                        {group.notifications.length}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    {group.notifications.map((notification) => {
                                        const Icon = getNotificationIcon(notification.type);
                                        const iconColor = getNotificationColor(notification.type);

                                        return (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "p-3 rounded-lg border cursor-pointer transition-colors",
                                                    notification.isRead
                                                        ? "bg-gray-50 border-gray-200"
                                                        : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                                                )}
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={cn(
                                                        "p-2 rounded-full",
                                                        notification.isRead ? "bg-gray-200" : "bg-white"
                                                    )}>
                                                        <Icon className={cn("h-4 w-4", iconColor)} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h5 className={cn(
                                                                    "font-medium text-sm",
                                                                    !notification.isRead && "text-blue-900"
                                                                )}>
                                                                    {notification.title}
                                                                </h5>
                                                                <p className={cn(
                                                                    "text-sm mt-1",
                                                                    notification.isRead ? "text-gray-600" : "text-blue-800"
                                                                )}>
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    {formatDate(notification.createdAt)}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center space-x-1 ml-2">
                                                                {notification.actionRequired && (
                                                                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                                                                        Action Required
                                                                    </Badge>
                                                                )}

                                                                {!notification.isRead && (
                                                                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {notification.actionUrl && (
                                                            <div className="flex items-center space-x-2 mt-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 px-2 text-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onViewRequest?.(notification.consentRequestId);
                                                                    }}
                                                                >
                                                                    <Eye className="h-3 w-3 mr-1" />
                                                                    View Details
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {groupIndex < notificationGroups.length - 1 && (
                                    <Separator className="mt-4" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}