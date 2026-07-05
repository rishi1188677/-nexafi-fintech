'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  created_at?: string
  updated_at?: string
}

interface ProfileContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const ProfileContext = React.createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Track if we have already fetched to prevent redundant calls on auth refresh
  const fetchedUserIdRef = React.useRef<string | null>(null)

  const fetchProfile = React.useCallback(async () => {
    const supabase = createClient()
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !currentUser) {
        setUser(null)
        setProfile(null)
        fetchedUserIdRef.current = null
        setLoading(false)
        return
      }

      setUser(currentUser)

      // Prevent redundant fetches if we already loaded this user's profile
      if (fetchedUserIdRef.current === currentUser.id && profile) {
        setLoading(false)
        return
      }

      // Safe fetch first
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      if (existingProfile) {
        setProfile(existingProfile)
        fetchedUserIdRef.current = currentUser.id
      } else {
        // Create only if missing
        const authFullName = currentUser.user_metadata?.full_name || ''
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            full_name: authFullName || null,
            currency: 'INR'
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }
        setProfile(newProfile)
        fetchedUserIdRef.current = currentUser.id
      }
    } catch (err: any) {
      console.error('Error fetching/creating profile:', err)
      setError(err?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [profile])

  React.useEffect(() => {
    fetchProfile()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchProfile()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        fetchedUserIdRef.current = null
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const updateProfile = React.useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user is signed in') }
    const supabase = createClient()
    try {
      // Clean updates to prevent overwriting existing full_name with an empty/null value from auth metadata
      const cleanUpdates = { ...updates }
      
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }
      setProfile(data)
      return { error: null }
    } catch (err: any) {
      console.error('Error updating profile:', err)
      return { error: err }
    }
  }, [user])

  const signOut = React.useCallback(async () => {
    setUser(null)
    setProfile(null)
    fetchedUserIdRef.current = null
    const supabase = createClient()
    await supabase.auth.signOut()
  }, [])

  const value = React.useMemo(() => ({
    user,
    profile,
    loading,
    error,
    refreshProfile: fetchProfile,
    updateProfile,
    signOut
  }), [user, profile, loading, error, fetchProfile, updateProfile, signOut])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = React.useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

export function getDisplayName(profile: Profile | null, user: User | null): string {
  if (profile?.full_name && profile.full_name.trim() !== '') {
    return profile.full_name.trim()
  }
  if (user?.user_metadata?.full_name && String(user.user_metadata.full_name).trim() !== '') {
    return String(user.user_metadata.full_name).trim()
  }
  if (user?.email) {
    return user.email.split('@')[0]
  }
  return 'User'
}

export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
