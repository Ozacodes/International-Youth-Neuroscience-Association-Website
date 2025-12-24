// IYNA Database Connection - js/database.js

const SUPABASE_URL = 'https://jxhkjdbcubmzprkhaoqb.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4aGtqZGJjdWJtenBya2hhb3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNzU5MDAsImV4cCI6MjA2Nzg1MTkwMH0.t0dp1yH7wU32Xuq987rlR-boIGHy9id4oi6g1KSdt2o'

// Check if Supabase is loaded
if (!window.supabase) {
    console.error('Supabase not loaded! Make sure the script tag is added.');
    // Create a fallback for testing
    window.supabase = {
        createClient: function() {
            console.error('Supabase client not available');
            return null;
        }
    };
}

// Initialize Supabase client using a different variable name
let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    // Expose client globally in a consistent name
    window.supabaseClient = supabaseClient;
    console.log('✅ Supabase client initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    supabaseClient = null;
    window.supabaseClient = null;
}

// Password hashing function using Web Crypto API
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Database functions to replace localStorage
const db = {
    // User functions
    async createUser(userData) {
        try {
            // Hash the password before storing
            const hashedPassword = await hashPassword(userData.password);
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Invalid email format');
            }

            // Validate required fields
            if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
                throw new Error('Missing required fields');
            }

            const { data, error } = await supabase
                .from('users')
                .insert([{
                    email: userData.email.toLowerCase().trim(),
                    password_hash: hashedPassword,
                    first_name: userData.firstName.trim(),
                    last_name: userData.lastName.trim(),
                    role: userData.role || 'member',
                    chapter_id: userData.chapterId || null,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
            
            if (error) {
                console.error('Database error:', error);
                throw error;
            }
            
            return data[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async loginUser(email, password) {
        try {
            // Check if supabase client is available
            if (!supabase) {
                throw new Error('Database connection not available. Please refresh the page and try again.');
            }

            // Hash the password to compare
            const hashedPassword = await hashPassword(password);
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Invalid email format');
            }

            console.log('Attempting login for email:', email.toLowerCase().trim());

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase().trim())
                .eq('password_hash', hashedPassword)
                .single()
            
            if (error) {
                console.error('Login error:', error);
                if (error.code === 'PGRST116') {
                    throw new Error('Database connection error. Please try again in a moment.');
                } else if (error.message.includes('No rows returned')) {
                    throw new Error('Invalid email or password. Please check your credentials and try again.');
                } else {
                    throw new Error('Login failed. Please try again.');
                }
            }
            
            console.log('Login successful for user:', data.id);
            return data;
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    },

    async getUser(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    },

    async getUserByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase().trim())
                .single()
            
            if (error) {
                console.error('Error in getUserByEmail:', error);
                throw error;
            }
            return data
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error
        }
    },

    async updateUser(userId, updateData) {
        try {
            // If password is being updated, hash it
            if (updateData.password) {
                updateData.password_hash = await hashPassword(updateData.password);
                delete updateData.password; // Remove plain text password
            }

            updateData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Events functions
    async getEvents() {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('event_date', { ascending: true })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error getting events:', error);
            throw error;
        }
    },

    async createEvent(eventData) {
        try {
            const { data, error } = await supabase
                .from('events')
                .insert([{
                    ...eventData,
                    created_at: new Date().toISOString()
                }])
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    async updateEvent(eventId, eventData) {
        try {
            const { data, error } = await supabase
                .from('events')
                .update(eventData)
                .eq('id', eventId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    async deleteEvent(eventId) {
        try {
            const { data, error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId)
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    // Tasks functions
    async getTasks() {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error getting tasks:', error);
            throw error;
        }
    },

    async createTask(taskData) {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([{
                    ...taskData,
                    created_at: new Date().toISOString()
                }])
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    async updateTask(taskId, taskData) {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(taskData)
                .eq('id', taskId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    async deleteTask(taskId) {
        try {
            // First check if there are any user task completions referencing this task
            const { data: completions, error: checkError } = await supabase
                .from('user_task_completions')
                .select('id')
                .eq('task_id', taskId)
            
            if (checkError) throw checkError
            
            if (completions && completions.length > 0) {
                throw new Error(`Cannot delete task: ${completions.length} user(s) have submitted completions for this task. Please handle these submissions first.`)
            }
            
            // If no completions exist, proceed with deletion
            const { data, error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    async forceDeleteTask(taskId) {
        try {
            // First delete all related user task completions
            const { error: deleteCompletionsError } = await supabase
                .from('user_task_completions')
                .delete()
                .eq('task_id', taskId)
            
            if (deleteCompletionsError) throw deleteCompletionsError
            
            // Then delete the task
            const { data, error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error force deleting task:', error);
            throw error;
        }
    },

    // Chapters functions
    async getChapters() {
        try {
            // First try the relationship approach
            let { data, error } = await supabase
                .from('chapters')
                .select(`
                    *,
                    director:director_id (
                        id,
                        first_name,
                        last_name,
                        email
                    )
                `)
                .order('school_name', { ascending: true })
            
            if (error) {
                console.warn('Relationship query failed, trying manual join:', error.message);
                
                // Fallback: Get chapters and users separately, then join manually
                const [chaptersResult, usersResult] = await Promise.all([
                    supabase.from('chapters').select('*').order('school_name', { ascending: true }),
                    supabase.from('users').select('id, first_name, last_name, email')
                ]);
                
                if (chaptersResult.error) throw chaptersResult.error;
                if (usersResult.error) throw usersResult.error;
                
                data = chaptersResult.data;
                const users = usersResult.data;
                
                // Create a map of users by ID for quick lookup
                const usersMap = new Map(users.map(user => [user.id, user]));
                
                // Add director information manually
                data = data.map(chapter => ({
                    ...chapter,
                    director: chapter.director_id ? usersMap.get(chapter.director_id) : null
                }));
            }
            
            // Add director_name field to each chapter
            const chaptersWithDirector = data.map(chapter => ({
                ...chapter,
                director_name: chapter.director ? `${chapter.director.first_name} ${chapter.director.last_name}` : 'No Director Assigned'
            }));
            
            return chaptersWithDirector
        } catch (error) {
            console.error('Error getting chapters:', error);
            throw error;
        }
    },

    async createChapter(chapterData) {
        try {
            const { data, error } = await supabase
                .from('chapters')
                .insert([{
                    ...chapterData,
                    created_at: new Date().toISOString()
                }])
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error creating chapter:', error);
            throw error;
        }
    },

    async updateChapter(chapterId, chapterData) {
        try {
            console.log('Updating chapter with data:', chapterData);
            
            // Try to update with all fields including points
            let { data, error } = await supabase
                .from('chapters')
                .update(chapterData)
                .eq('id', chapterId)
                .select()
            
            if (error) {
                console.error('Update error:', error);
                
                // If the error is about points column, try without it
                if (error.message.includes('points') && chapterData.points !== undefined) {
                    console.warn('Points column not found, updating without points field');
                    const { points, ...chapterDataWithoutPoints } = chapterData;
                    
                    const { data: dataWithoutPoints, error: errorWithoutPoints } = await supabase
                        .from('chapters')
                        .update(chapterDataWithoutPoints)
                        .eq('id', chapterId)
                        .select()
                    
                    if (errorWithoutPoints) throw errorWithoutPoints;
                    return dataWithoutPoints[0];
                } else {
                    throw error;
                }
            }
            
            console.log('Chapter updated successfully:', data[0]);
            return data[0]
        } catch (error) {
            console.error('Error updating chapter:', error);
            throw error;
        }
    },

    async deleteChapter(chapterId) {
        try {
            const { data, error } = await supabase
                .from('chapters')
                .delete()
                .eq('id', chapterId)
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error deleting chapter:', error);
            throw error;
        }
    },

    // Delete user account
    async deleteUser(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId)
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // User registration and event registration functions
    async registerUserForEvent(userId, eventId) {
        try {
            // Check if user is already registered
            const { data: existing, error: checkError } = await supabase
                .from('event_registrations')
                .select('id')
                .eq('user_id', userId)
                .eq('event_id', eventId)
                .single()

            if (existing) {
                throw new Error('User is already registered for this event');
            }

            const { data, error } = await supabase
                .from('event_registrations')
                .insert([{
                    user_id: userId,
                    event_id: eventId,
                    registered_at: new Date().toISOString()
                }])
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error registering user for event:', error);
            throw error;
        }
    },

    async getUserEventRegistrations(userId) {
        try {
            const { data, error } = await supabase
                .from('event_registrations')
                .select(`
                    *,
                    events (
                        id,
                        title,
                        description,
                        event_date,
                        status
                    )
                `)
                .eq('user_id', userId)
                .order('registered_at', { ascending: false })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error getting user event registrations:', error);
            throw error;
        }
    },

    // Admin functions
    async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    },

    async updateUserRole(userId, newRole) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ 
                    role: newRole,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    },

    async updateUserStatus(userId, isActive) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ 
                    is_active: isActive,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    },

    // Stats functions for admin dashboard
    async getStats() {
        try {
            console.log('Getting stats...');
            
            // Get all data with error handling for each
            let users = [];
            let events = [];
            let tasks = [];
            let chapters = [];
            
            try {
                users = await this.getAllUsers();
                console.log('Users loaded:', users.length);
            } catch (error) {
                console.error('Error loading users:', error);
                users = [];
            }
            
            try {
                events = await this.getEvents();
                console.log('Events loaded:', events.length);
            } catch (error) {
                console.error('Error loading events:', error);
                events = [];
            }
            
            try {
                tasks = await this.getTasks();
                console.log('Tasks loaded:', tasks.length);
            } catch (error) {
                console.error('Error loading tasks:', error);
                tasks = [];
            }
            
            try {
                chapters = await this.getChapters();
                console.log('Chapters loaded:', chapters.length);
            } catch (error) {
                console.error('Error loading chapters:', error);
                chapters = [];
            }

            const now = new Date();
            const activeUsers = users.filter(u => u.is_active);
            const upcomingEvents = events.filter(e => {
                try {
                    return new Date(e.event_date) > now;
                } catch (error) {
                    console.warn('Invalid event date:', e.event_date);
                    return false;
                }
            });
            const recentUsers = users.filter(u => {
                try {
                const created = new Date(u.created_at);
                const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                return created > thirtyDaysAgo;
                } catch (error) {
                    console.warn('Invalid user created_at:', u.created_at);
                    return false;
                }
            });

            const stats = {
                totalUsers: users.length,
                activeUsers: activeUsers.length,
                recentUsers: recentUsers.length,
                totalEvents: events.length,
                upcomingEvents: upcomingEvents.length,
                totalTasks: tasks.length,
                totalChapters: chapters.length,
                usersByRole: {
                    chapter_lead: users.filter(u => u.role === 'chapter_lead').length,
                    'chapter-lead': users.filter(u => u.role === 'chapter-lead').length,
                    member: users.filter(u => u.role === 'member').length
                }
            };
            
            console.log('Stats calculated:', stats);
            return stats;
        } catch (error) {
            console.error('Error getting stats:', error);
            // Return default stats instead of throwing
            return {
                totalUsers: 0,
                activeUsers: 0,
                recentUsers: 0,
                totalEvents: 0,
                upcomingEvents: 0,
                totalTasks: 0,
                totalChapters: 0,
                usersByRole: {
                    admin: 0,
                    'chapter-lead': 0,
                    member: 0
                }
            };
        }
    },

    // Search functions
    async searchUsers(query) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    },

    async searchEvents(query) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                .order('event_date', { ascending: true })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error searching events:', error);
            throw error;
        }
    },

    // Utility functions
    async checkEmailExists(email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase().trim())
                .single()
            
            // If no error and data exists, email is taken
            return !!data;
        } catch (error) {
            // If error is "No rows returned", email is available
            return false;
        }
    },

    async getChapterByCode(chapterCode) {
        try {
            const { data, error } = await supabase
                .from('chapters')
                .select('*')
                .eq('chapter_code', chapterCode.toUpperCase())
                .single()
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error getting chapter by code:', error);
            throw error;
        }
    },

    // NEW FUNCTIONS FOR ADMIN DASHBOARD //

    // Point Requests functions
    async getPointRequests() {
        try {
            console.log('Getting point requests from database...');
            
            // Get requests from user_task_completions table (without relationships first)
            const { data: taskCompletions, error: completionsError } = await supabase
                .from('user_task_completions')
                .select('*')
                .order('completed_at', { ascending: false })
            
            if (completionsError) {
                console.error('Error getting task completions:', completionsError);
            } else {
                console.log('Task completions found:', taskCompletions?.length || 0);
            }
            
            // Get requests from task_submissions table (without relationships first)
            const { data: taskSubmissions, error: submissionsError } = await supabase
                .from('task_submissions')
                .select('*')
                .order('submitted_at', { ascending: false })
            
            if (submissionsError) {
                console.error('Error getting task submissions:', submissionsError);
            } else {
                console.log('Task submissions found:', taskSubmissions?.length || 0);
            }
            
            // Get all users for manual joining
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, first_name, last_name, email, role, chapter_id')
            
            if (usersError) {
                console.error('Error getting users:', usersError);
            }
            
            // Get all chapters for manual joining
            const { data: chapters, error: chaptersError } = await supabase
                .from('chapters')
                .select('id, school_name, chapter_code')
            
            if (chaptersError) {
                console.error('Error getting chapters:', chaptersError);
            }
            
            // Get all tasks for manual joining
            const { data: tasks, error: tasksError } = await supabase
                .from('tasks')
                .select('id, title, task_code, points')
            
            if (tasksError) {
                console.error('Error getting tasks:', tasksError);
            }
            
            // Create lookup maps
            const usersMap = new Map((users || []).map(user => [user.id, user]));
            const chaptersMap = new Map((chapters || []).map(chapter => [chapter.id, chapter]));
            const tasksMap = new Map((tasks || []).map(task => [task.id, task]));
            
            // Manually join task completions with user and task data
            const joinedTaskCompletions = (taskCompletions || []).map(completion => ({
                ...completion,
                user: usersMap.get(completion.user_id) || null,
                task: tasksMap.get(completion.task_id) || null
            }));
            
            // Manually join task submissions with user and chapter data
            const joinedTaskSubmissions = (taskSubmissions || []).map(submission => {
                const user = usersMap.get(submission.user_id) || null;
                const chapter = chaptersMap.get(submission.chapter_id) || null;
                
                return {
                id: submission.id,
                user_id: submission.user_id,
                    user: user,
                task: {
                    id: null,
                    title: submission.task_name || 'Custom Task',
                    task_code: submission.task_code || 'N/A',
                    points: submission.awarded_points || 0
                },
                points_awarded: submission.awarded_points || 0,
                evidence: submission.evidence || 'No evidence provided',
                completed_at: submission.submitted_at || submission.created_at || new Date().toISOString(),
                status: submission.status || 'pending',
                    submission_type: 'task_submission', // Add this to distinguish from task completions
                    chapter: chapter
                };
            });
            
            // Combine both types of requests
            const allRequests = [...joinedTaskCompletions, ...joinedTaskSubmissions];
            
            // Sort by submission date (most recent first)
            allRequests.sort((a, b) => {
                const dateA = new Date(a.completed_at || a.submitted_at || a.created_at);
                const dateB = new Date(b.completed_at || b.submitted_at || b.created_at);
                return dateB - dateA;
            });
            
            console.log('Total point requests found:', allRequests.length);
            return allRequests;
        } catch (error) {
            console.error('Error getting point requests:', error);
            throw error;
        }
    },

    async approvePointRequest(requestId, submissionType = null) {
        try {
            // Determine which table to update based on submission type
            const tableName = submissionType === 'task_submission' ? 'task_submissions' : 'user_task_completions';
            
            // First, get the request details to find the user and points
            const { data: requestData, error: requestError } = await supabase
                .from(tableName)
                .select('*')
                .eq('id', requestId)
                .single();
            
            if (requestError) throw requestError;
            if (!requestData) throw new Error('Request not found');
            
            // Update the request status to approved
            const { data, error } = await supabase
                .from(tableName)
                .update({ status: 'approved' })
                .eq('id', requestId)
                .select()
            
            if (error) throw error;
            
            // After approving, update the chapter points
            await this.updateChapterPoints(requestData.user_id);
            
            return data[0]
        } catch (error) {
            console.error('Error approving point request:', error);
            throw error;
        }
    },

    // New function to calculate and update chapter points
    async updateChapterPoints(userId) {
        try {
            // Get the user to find their chapter
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('chapter_id')
                .eq('id', userId)
                .single();
            
            if (userError) throw userError;
            if (!user || !user.chapter_id) {
                console.log('User has no chapter, skipping chapter points update');
                return;
            }
            
            // Get all users in the chapter
            const { data: chapterUsers, error: usersError } = await supabase
                .from('users')
                .select('id')
                .eq('chapter_id', user.chapter_id);
            
            if (usersError) throw usersError;
            
            const userIds = chapterUsers.map(u => u.id);
            
            // Calculate total approved points for all members in the chapter
            const { data: approvedPoints, error: pointsError } = await supabase
                .from('user_task_completions')
                .select('points_awarded')
                .eq('status', 'approved')
                .in('user_id', userIds);
            
            if (pointsError) throw pointsError;
            
            // Also get approved task submissions
            const { data: approvedSubmissions, error: submissionsError } = await supabase
                .from('task_submissions')
                .select('awarded_points')
                .eq('status', 'approved')
                .in('user_id', userIds);
            
            if (submissionsError) throw submissionsError;
            
            // Calculate total points
            const taskCompletionsPoints = approvedPoints.reduce((sum, item) => sum + (item.points_awarded || 0), 0);
            const taskSubmissionsPoints = approvedSubmissions.reduce((sum, item) => sum + (item.awarded_points || 0), 0);
            const totalChapterPoints = taskCompletionsPoints + taskSubmissionsPoints;
            
            // Update the chapter's points
            const { error: updateError } = await supabase
                .from('chapters')
                .update({ points: totalChapterPoints })
                .eq('id', user.chapter_id);
            
            if (updateError) throw updateError;
            
            console.log(`Updated chapter ${user.chapter_id} points to ${totalChapterPoints}`);
            
        } catch (error) {
            console.error('Error updating chapter points:', error);
            // Don't throw error to avoid breaking the approval process
        }
    },

    // Function to recalculate all chapter points (for admin use)
    async recalculateAllChapterPoints() {
        try {
            console.log('Starting recalculation of all chapter points...');
            
            // Get all chapters
            const { data: chapters, error: chaptersError } = await supabase
                .from('chapters')
                .select('id, school_name');
            
            if (chaptersError) throw chaptersError;
            
            for (const chapter of chapters) {
                // Get all users in this chapter
                const { data: chapterUsers, error: usersError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('chapter_id', chapter.id);
                
                if (usersError) {
                    console.error(`Error getting users for chapter ${chapter.id}:`, usersError);
                    continue;
                }
                
                if (chapterUsers.length === 0) {
                    // No users in chapter, set points to 0
                    await supabase
                        .from('chapters')
                        .update({ points: 0 })
                        .eq('id', chapter.id);
                    console.log(`Chapter ${chapter.school_name} (${chapter.id}): 0 points (no members)`);
                    continue;
                }
                
                const userIds = chapterUsers.map(u => u.id);
                
                // Get approved task completions
                const { data: approvedPoints, error: pointsError } = await supabase
                    .from('user_task_completions')
                    .select('points_awarded')
                    .eq('status', 'approved')
                    .in('user_id', userIds);
                
                if (pointsError) {
                    console.error(`Error getting task completions for chapter ${chapter.id}:`, pointsError);
                    continue;
                }
                
                // Get approved task submissions
                const { data: approvedSubmissions, error: submissionsError } = await supabase
                    .from('task_submissions')
                    .select('awarded_points')
                    .eq('status', 'approved')
                    .in('user_id', userIds);
                
                if (submissionsError) {
                    console.error(`Error getting task submissions for chapter ${chapter.id}:`, submissionsError);
                    continue;
                }
                
                // Calculate total points
                const taskCompletionsPoints = approvedPoints.reduce((sum, item) => sum + (item.points_awarded || 0), 0);
                const taskSubmissionsPoints = approvedSubmissions.reduce((sum, item) => sum + (item.awarded_points || 0), 0);
                const totalChapterPoints = taskCompletionsPoints + taskSubmissionsPoints;
                
                // Update the chapter's points
                const { error: updateError } = await supabase
                    .from('chapters')
                    .update({ points: totalChapterPoints })
                    .eq('id', chapter.id);
                
                if (updateError) {
                    console.error(`Error updating chapter ${chapter.id}:`, updateError);
                } else {
                    console.log(`Chapter ${chapter.school_name} (${chapter.id}): ${totalChapterPoints} points`);
                }
            }
            
            console.log('Completed recalculation of all chapter points');
            
        } catch (error) {
            console.error('Error recalculating all chapter points:', error);
            throw error;
        }
    },

    async rejectPointRequest(requestId, submissionType = null) {
        try {
            // Determine which table to update based on submission type
            const tableName = submissionType === 'task_submission' ? 'task_submissions' : 'user_task_completions';
            
            const { data, error } = await supabase
                .from(tableName)
                .update({ status: 'rejected' })
                .eq('id', requestId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error rejecting point request:', error);
            throw error;
        }
    },

    // Chapter Requests functions
    async getChapterRequests() {
        try {
            const { data, error } = await supabase
                .from('chapter_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error getting chapter requests:', error);
            throw error;
        }
    },

    async approveChapterRequest(requestId, customChapterCode = null) {
        try {
            console.log('=== STARTING CHAPTER REQUEST APPROVAL ===');
            console.log('Request ID to approve:', requestId);
            
            // First, get the chapter request details
            console.log('Step 1: Getting chapter request details...');
            const { data: requestData, error: requestError } = await supabase
                .from('chapter_requests')
                .select('*')
                .eq('id', requestId)
                .single();
            
            if (requestError) {
                console.error('Error getting chapter request:', requestError);
                throw new Error('Failed to get chapter request: ' + requestError.message);
            }
            if (!requestData) {
                console.error('Chapter request not found for ID:', requestId);
                throw new Error('Chapter request not found');
            }
            
            console.log('Chapter request data retrieved successfully:', requestData);
            
            // Idempotency: ensure request is still pending
            if (requestData.status && requestData.status !== 'pending') {
                throw new Error(`Cannot approve request: current status is '${requestData.status}'.`);
            }

            // Prevent duplicate school entries: check existing chapters by school_name
            const { data: existingBySchool, error: existingSchoolErr } = await supabase
                .from('chapters')
                .select('id, school_name, chapter_code')
                .eq('school_name', requestData.school_name)
                .maybeSingle();
            if (existingSchoolErr && existingSchoolErr.code && existingSchoolErr.code !== 'PGRST116') {
                console.warn('Warning checking for existing chapter by school:', existingSchoolErr);
            }
            if (existingBySchool) {
                throw new Error(`A chapter for '${requestData.school_name}' already exists (code ${existingBySchool.chapter_code}).`);
            }

            // Find the user by email
            console.log('Step 2: Finding user by email:', requestData.requester_email);
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', requestData.requester_email)
                .single();
            
            if (userError) {
                console.error('Error finding user:', userError);
                throw new Error('Failed to find user: ' + userError.message);
            }
            if (!userData) {
                console.error('User not found for email:', requestData.requester_email);
                throw new Error('User not found');
            }
            
            console.log('User data retrieved successfully:', userData);
            
            // Generate or use custom chapter code
            console.log('Step 3: Setting chapter code for school:', requestData.school_name);
            let chapterCode;
            
            if (customChapterCode) {
                chapterCode = customChapterCode;
                console.log('Using custom chapter code:', chapterCode);
            } else {
                // Generate a unique chapter code (school abbreviation + random number)
                const schoolAbbrev = requestData.school_name.split(' ').map(word => word[0]).join('').toUpperCase();
                const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                chapterCode = `${schoolAbbrev}${randomNum}`;
                console.log('Generated chapter code:', chapterCode);
            }
            
            // Pre-check: ensure no existing chapter with same code
            const { data: existingChapter, error: existingErr } = await supabase
                .from('chapters')
                .select('id, school_name, chapter_code')
                .eq('chapter_code', chapterCode)
                .maybeSingle();
            if (existingErr && existingErr.code && existingErr.code !== 'PGRST116') {
                console.warn('Warning checking for existing chapter:', existingErr);
            }
            if (existingChapter) {
                throw new Error(`Chapter with code ${chapterCode} already exists for ${existingChapter.school_name}.`);
            }

            // Create the new chapter
            const chapterData = {
                school_name: requestData.school_name, // Use 'name' for the name column
                chapter_code: chapterCode,
                director_id: userData.id,
                status: 'active',
                created_at: new Date().toISOString()
            };
            console.log('Chapter data prepared:', chapterData);
            
            console.log('Creating chapter with data:', chapterData);
            
            const { data: newChapter, error: chapterError } = await supabase
                .from('chapters')
                .insert([chapterData])
                .select()
                .single();
            
            if (chapterError) {
                console.error('Chapter creation error details:', chapterError);
                // Provide clearer guidance for common conflicts
                if ((chapterError.code === '23505') || /duplicate key value/i.test(chapterError.message)) {
                    if (/chapters_pkey/i.test(chapterError.message)) {
                        throw new Error('Failed to create chapter: Primary key conflict. This usually means the chapters ID sequence is out of sync. Please reset the chapters id sequence in Supabase (set it to max(id)+1) and try again.');
                    }
                    if (/chapter_code/i.test(chapterError.message)) {
                        throw new Error(`Failed to create chapter: Chapter code ${chapterCode} already exists.`);
                    }
                }
                throw new Error('Failed to create chapter: ' + chapterError.message);
            }
            
            console.log('New chapter created successfully:', newChapter);
            
            // Update the user's role to chapter_director and assign them to the chapter
            console.log('Step 4: Updating user role to chapter_director...');
            const { error: userUpdateError } = await supabase
                .from('users')
                .update({
                    role: 'chapter_director',
                    chapter_id: newChapter.id
                })
                .eq('id', userData.id);
            
            if (userUpdateError) {
                console.error('Error updating user role:', userUpdateError);
                throw new Error('Failed to update user role: ' + userUpdateError.message);
            }
            
            console.log('User role updated to chapter_director successfully');
            
            // Update the chapter request status to approved
            console.log('Step 5: Updating chapter request status to approved...');
            const { data: updatedRequest, error: requestUpdateError } = await supabase
                .from('chapter_requests')
                .update({ status: 'approved' })
                .eq('id', requestId)
                .select()
                .single();
            
            if (requestUpdateError) {
                console.error('Error updating chapter request status:', requestUpdateError);
                throw new Error('Failed to update chapter request status: ' + requestUpdateError.message);
            }
            
            console.log('Chapter request status updated to approved successfully');
            console.log('Updated request data:', updatedRequest);
            
            console.log('=== CHAPTER REQUEST APPROVAL COMPLETED SUCCESSFULLY ===');
            return {
                chapter: newChapter,
                user: userData,
                request: updatedRequest
            };
            
        } catch (error) {
            console.error('=== CHAPTER REQUEST APPROVAL FAILED ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    async rejectChapterRequest(chapterId) {
        try {
            const { data, error } = await supabase
                .from('chapter_requests')
                .update({ status: 'rejected' })
                .eq('id', chapterId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error rejecting chapter request:', error);
            throw error;
        }
    },

    // Announcements functions
    async getAnnouncements() {
        try {
            // First try with priority ordering
            let { data, error } = await supabase
                .from('announcements')
                .select(`
                    *,
                    creator:created_by (
                        id,
                        first_name,
                        last_name
                    )
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
            
            if (error) throw error;
            
            // Sort by priority in JavaScript if the column exists, otherwise just return by date
            if (data && data.length > 0) {
                data.sort((a, b) => {
                    // If priority exists, sort by it first (highest priority first)
                    if (a.priority !== undefined && b.priority !== undefined) {
                        if (a.priority !== b.priority) {
                            return (b.priority || 0) - (a.priority || 0);
                        }
                    }
                    // Then sort by created_at (newest first)
                    return new Date(b.created_at) - new Date(a.created_at);
                });
            }
            
            return data;
        } catch (error) {
            console.error('Error getting announcements:', error);
            throw error;
        }
    },

    async createAnnouncement(announcementData) {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .insert([{
                    ...announcementData,
                    created_at: new Date().toISOString()
                }])
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error creating announcement:', error);
            throw error;
        }
    },

    async updateAnnouncement(announcementId, announcementData) {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .update(announcementData)
                .eq('id', announcementId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error updating announcement:', error);
            throw error;
        }
    },

    async deleteAnnouncement(announcementId) {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .update({ is_active: false })
                .eq('id', announcementId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error deleting announcement:', error);
            throw error;
        }
    },

    // Helper function to create point request
    async createPointRequest(userId, taskId, pointsRequested, evidence, fileUrls = '') {
        try {
            const insertData = {
                    user_id: userId,
                    task_id: taskId,
                    points_awarded: pointsRequested,
                    evidence: evidence,
                    status: 'pending',
                    completed_at: new Date().toISOString()
            };

            // Add file_urls if provided
            if (fileUrls) {
                insertData.file_urls = fileUrls;
            }

            const { data, error } = await supabase
                .from('user_task_completions')
                .insert([insertData])
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error creating point request:', error);
            throw error;
        }
    },

    // Helper function to create chapter request
    async createChapterRequest(chapterData) {
        try {
            const { data, error } = await supabase
                .from('chapter_requests')
                .insert([{
                    requester_name: chapterData.requester_name,
                    requester_email: chapterData.requester_email,
                    school_name: chapterData.school_name,
                    reason: chapterData.reason,
                    status: 'pending',
                    user_id: chapterData.user_id,
                    created_at: new Date().toISOString()
                }])
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error creating chapter request:', error);
            throw error;
        }
    },

    // Task Submission functions
    async createTaskSubmission(submissionData) {
        try {
            console.log('Database function received submissionData:', submissionData);
            console.log('Awarded points type:', typeof submissionData.awarded_points);
            console.log('Awarded points value:', submissionData.awarded_points);
            
            const insertData = {
                user_id: submissionData.user_id,
                chapter_id: submissionData.chapter_id,
                task_name: submissionData.task_name,
                task_code: submissionData.task_code,
                awarded_points: submissionData.awarded_points,
                deadline: submissionData.deadline,
                evidence: submissionData.evidence,
                evidence_files: submissionData.evidence_files || [],
                status: 'pending',
                submitted_at: new Date().toISOString()
            };
            
            console.log('Data being inserted into Supabase:', insertData);
            
            const { data, error } = await supabase
                .from('task_submissions')
                .insert([insertData])
                .select()
            
            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }
            
            console.log('Supabase insert successful, returned data:', data[0]);
            return data[0]
        } catch (error) {
            console.error('Error creating task submission:', error);
            throw error;
        }
    },

    async getTaskSubmissions(userId = null, chapterId = null) {
        try {
            let query = supabase
                .from('task_submissions')
                .select(`
                    *,
                    user:user_id (
                        id,
                        first_name,
                        last_name,
                        email
                    ),
                    chapter:chapter_id (
                        id,
                        school_name,
                        chapter_code
                    ),
                    reviewer:reviewed_by (
                        id,
                        first_name,
                        last_name
                    )
                `)
                .order('submitted_at', { ascending: false })
            
            if (userId) {
                query = query.eq('user_id', userId)
            }
            
            if (chapterId) {
                query = query.eq('chapter_id', chapterId)
            }
            
            const { data, error } = await query
            
            if (error) throw error
            return data
        } catch (error) {
            console.error('Error getting task submissions:', error);
            throw error;
        }
    },

    async updateTaskSubmission(submissionId, updateData) {
        try {
            const { data, error } = await supabase
                .from('task_submissions')
                .update({
                    ...updateData,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', submissionId)
                .select()
            
            if (error) throw error
            return data[0]
        } catch (error) {
            console.error('Error updating task submission:', error);
            throw error;
        }
    },

    async approveTaskSubmission(submissionId, reviewerId, reviewNotes = null) {
        try {
            return await this.updateTaskSubmission(submissionId, {
                status: 'approved',
                reviewed_by: reviewerId,
                review_notes: reviewNotes
            })
        } catch (error) {
            console.error('Error approving task submission:', error);
            throw error;
        }
    },

    async rejectTaskSubmission(submissionId, reviewerId, reviewNotes = null) {
        try {
            return await this.updateTaskSubmission(submissionId, {
                status: 'rejected',
                reviewed_by: reviewerId,
                review_notes: reviewNotes
            })
        } catch (error) {
            console.error('Error rejecting task submission:', error);
            throw error;
        }
    },

    // Get next available chapter code
    async getNextChapterCode(countryCode = 'USA') {
        try {
            const { data: existingChapters, error } = await supabase
                .from('chapters')
                .select('chapter_code')
                .like('chapter_code', `${countryCode}%`)
                .order('chapter_code', { ascending: false })
                .limit(1);

            if (error) throw error;

            let nextNumber = 1;
            if (existingChapters && existingChapters.length > 0) {
                const lastCode = existingChapters[0].chapter_code;
                const numberPart = lastCode.replace(countryCode, '');
                const lastNumber = parseInt(numberPart) || 0;
                nextNumber = lastNumber + 1;
            }

            return `${countryCode}${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error getting next chapter code:', error);
            return `${countryCode}${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
        }
    },

    // Join user to chapter
    async joinUserToChapter(userId, chapterId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ 
                    chapter_id: chapterId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select();
            
            if (error) throw error;

            // Update session if it's the current user
            if (currentUserSession && currentUserSession.id === userId) {
                currentUserSession.chapterId = chapterId;
                localStorage.setItem('userSession', JSON.stringify(currentUserSession));
            }

            return data[0];
        } catch (error) {
            console.error('Error joining user to chapter:', error);
            throw error;
        }
    },

    async createUser(userData) {
        try {
            // Hash the password before storing
            const hashedPassword = await hashPassword(userData.password);
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Invalid email format');
            }

            // Validate required fields
            if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
                throw new Error('Missing required fields');
            }

            const { data, error } = await supabase
                .from('users')
                .insert([{
                    email: userData.email.toLowerCase().trim(),
                    password_hash: hashedPassword,
                    first_name: userData.firstName.trim(),
                    last_name: userData.lastName.trim(),
                    role: userData.role || 'member',
                    chapter_id: userData.chapterId || null,
                    discord_username: userData.discord_username || null, // Add discord username support
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
            
            if (error) {
                console.error('Database error:', error);
                throw error;
            }
            
            return data[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Updated updateUser function to properly handle discord_username
    async updateUser(userId, updateData) {
        try {
            // If password is being updated, hash it
            if (updateData.password) {
                updateData.password_hash = await hashPassword(updateData.password);
                delete updateData.password; // Remove plain text password
            }

            // Handle discord_username updates
            if (updateData.hasOwnProperty('discord_username')) {
                // Allow null/empty values to clear the discord username
                updateData.discord_username = updateData.discord_username || null;
            }

            updateData.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
            
            if (error) {
                console.error('Error updating user:', error);
                throw error;
            }
            
            return data[0];
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // New function to update just the Discord username
    async updateDiscordUsername(userId, discordUsername) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ 
                    discord_username: discordUsername || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating Discord username:', error);
            throw error;
        }
    },

    // New function to get users with Discord usernames (for community features)
    async getUsersWithDiscord() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, first_name, last_name, discord_username, chapter_id')
                .not('discord_username', 'is', null)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting users with Discord:', error);
            throw error;
        }
    },

    // New function to search users by Discord username
    async searchUsersByDiscord(discordQuery) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, first_name, last_name, discord_username, chapter_id')
                .ilike('discord_username', `%${discordQuery}%`)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error searching users by Discord:', error);
            throw error;
        }
    },

    // Chapter Request functions
    async createChapterRequest(requestData) {
        try {
            const { data, error } = await supabase
                .from('chapter_request')
                .insert([{
                    user_id: requestData.user_id,
                    user_name: requestData.user_name,
                    user_email: requestData.user_email,
                    school_name: requestData.school_name,
                    reason: requestData.reason,
                    status: 'pending',
                    requested_at: new Date().toISOString()
                }])
                .select()
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating chapter request:', error);
            throw error;
        }
    },

    async getChapterRequests(status = 'pending') {
        try {
            let query = supabase
                .from('chapter_request')
                .select('*')
                .order('requested_at', { ascending: false });
            
            if (status) {
                query = query.eq('status', status);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting chapter requests:', error);
            throw error;
        }
    },

    async updateChapterRequest(requestId, updateData) {
        try {
            updateData.processed_at = new Date().toISOString();
            
            const { data, error } = await supabase
                .from('chapter_request')
                .update(updateData)
                .eq('id', requestId)
                .select()
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating chapter request:', error);
            throw error;
        }
    },

    async approveChapterRequest(requestId, customChapterCode = null) {
        try {
            console.log('=== STARTING CHAPTER REQUEST APPROVAL ===');
            console.log('Request ID to approve:', requestId);
            
            // First, get the chapter request details
            console.log('Step 1: Getting chapter request details...');
            const { data: requestData, error: requestError } = await supabase
                .from('chapter_request')
                .select('*')
                .eq('id', requestId)
                .single();
            
            if (requestError) {
                console.error('Error getting chapter request:', requestError);
                throw new Error('Failed to get chapter request: ' + requestError.message);
            }
            if (!requestData) {
                console.error('Chapter request not found for ID:', requestId);
                throw new Error('Chapter request not found');
            }
            
            console.log('Chapter request data retrieved successfully:', requestData);
            
            // Find the user by email
            console.log('Step 2: Finding user by email:', requestData.user_email);
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', requestData.user_email)
                .single();
            
            if (userError) {
                console.error('Error finding user:', userError);
                throw new Error('Failed to find user: ' + userError.message);
            }
            if (!userData) {
                console.error('User not found for email:', requestData.user_email);
                throw new Error('User not found');
            }
            
            console.log('User data retrieved successfully:', userData);
            
            // Generate or use custom chapter code
            console.log('Step 3: Setting chapter code for school:', requestData.school_name);
            let chapterCode;
            
            if (customChapterCode) {
                chapterCode = customChapterCode;
                console.log('Using custom chapter code:', chapterCode);
            } else {
                // Generate a unique chapter code (school abbreviation + random number)
                const schoolAbbrev = requestData.school_name.split(' ').map(word => word[0]).join('').toUpperCase();
                const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                chapterCode = `${schoolAbbrev}${randomNum}`;
                console.log('Generated chapter code:', chapterCode);
            }
            
            // Pre-check: ensure no existing chapter with same code
            const { data: existingChapter, error: existingErr } = await supabase
                .from('chapters')
                .select('id, school_name, chapter_code')
                .eq('chapter_code', chapterCode)
                .maybeSingle();
            if (existingErr && existingErr.code && existingErr.code !== 'PGRST116') {
                console.warn('Warning checking for existing chapter:', existingErr);
            }
            if (existingChapter) {
                throw new Error(`Chapter with code ${chapterCode} already exists for ${existingChapter.school_name}.`);
            }

            // Create the new chapter
            const chapterData = {
                school_name: requestData.school_name,
                chapter_code: chapterCode,
                director_id: userData.id,
                status: 'active',
                created_at: new Date().toISOString()
            };
            console.log('Chapter data prepared:', chapterData);
            
            console.log('Creating chapter with data:', chapterData);
            
            const { data: newChapter, error: chapterError } = await supabase
                .from('chapters')
                .insert([chapterData])
                .select()
                .single();
            
            if (chapterError) {
                console.error('Chapter creation error details:', chapterError);
                // Provide clearer guidance for common conflicts
                if ((chapterError.code === '23505') || /duplicate key value/i.test(chapterError.message)) {
                    if (/chapters_pkey/i.test(chapterError.message)) {
                        throw new Error('Failed to create chapter: Primary key conflict. This usually means the chapters ID sequence is out of sync. Please reset the chapters id sequence in Supabase (set it to max(id)+1) and try again.');
                    }
                    if (/chapter_code/i.test(chapterError.message)) {
                        throw new Error(`Failed to create chapter: Chapter code ${chapterCode} already exists.`);
                    }
                }
                throw new Error('Failed to create chapter: ' + chapterError.message);
            }
            
            console.log('New chapter created successfully:', newChapter);
            
            // Update the user's role to chapter_director and assign them to the chapter
            console.log('Step 4: Updating user role to chapter_director...');
            const { error: userUpdateError } = await supabase
                .from('users')
                .update({
                    role: 'chapter_director',
                    chapter_id: newChapter.id
                })
                .eq('id', userData.id);
            
            if (userUpdateError) {
                console.error('Error updating user role:', userUpdateError);
                throw new Error('Failed to update user role: ' + userUpdateError.message);
            }
            
            console.log('User role updated to chapter_director successfully');
            
            // Update the chapter request status to approved
            console.log('Step 5: Updating chapter request status to approved...');
            const { data: updatedRequest, error: requestUpdateError } = await supabase
                .from('chapter_request')
                .update({ 
                    status: 'approved',
                    processed_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .select()
                .single();
            
            if (requestUpdateError) {
                console.error('Error updating chapter request status:', requestUpdateError);
                throw new Error('Failed to update chapter request status: ' + requestUpdateError.message);
            }
            
            console.log('Chapter request status updated to approved successfully');
            console.log('Updated request data:', updatedRequest);
            
            console.log('=== CHAPTER REQUEST APPROVAL COMPLETED SUCCESSFULLY ===');
            return {
                chapter: newChapter,
                user: userData,
                request: updatedRequest
            };
            
        } catch (error) {
            console.error('=== CHAPTER REQUEST APPROVAL FAILED ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            throw error;
        }
    },

    async rejectChapterRequest(requestId, adminNotes = null) {
        try {
            const updateData = {
                status: 'rejected',
                processed_at: new Date().toISOString()
            };
            
            if (adminNotes) {
                updateData.admin_notes = adminNotes;
            }
            
            const { data, error } = await supabase
                .from('chapter_request')
                .update(updateData)
                .eq('id', requestId)
                .select()
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error rejecting chapter request:', error);
            throw error;
        }
    },

    async getUserChapterRequests(userId) {
        try {
            const { data, error } = await supabase
                .from('chapter_request')
                .select('*')
                .eq('user_id', userId)
                .order('requested_at', { ascending: false })
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting user chapter requests:', error);
            throw error;
        }
    }
           
  
}

// Export for use in other files
window.db = db

// Test connection function
window.testDatabaseConnection = async function() {
    try {
        console.log('Testing database connection...')
        
        if (!supabase) {
            console.error('❌ Supabase client not initialized');
            return false;
        }
        
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1)
        
        if (error) {
            console.error('Database connection test failed:', error);
            throw error;
        }
        
        console.log('✅ Database connection successful!')
        return true
    } catch (error) {
        console.error('❌ Database connection failed:', error)
        return false
    }

    
}

// Initialize connection test on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        // Small delay to ensure everything is loaded
        setTimeout(() => {
            async function testDatabaseConnection() {
                const { data, error } = await supabase.from('users').select('*').limit(1);
                if (error) {
                    console.error('Connection test failed:', error);
                } else {
                    console.log('Database connection working. Sample data:', data);
                }
            }

            window.testDatabaseConnection = testDatabaseConnection;

        }, 1000);
    });
}
