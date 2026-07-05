'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  User as UserIcon,
  Coins,
  Shield,
  LogOut,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProfile, getDisplayName, getInitials } from '@/components/dashboard/profile-context'

export function SettingsClient({ userId }: { userId: string }) {
  const router = useRouter()
  const { user, profile, loading: profileLoading, updateProfile, signOut } = useProfile()

  const [fullName, setFullName] = React.useState('')
  const [currency, setCurrency] = React.useState('INR')
  const [saving, setSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [signingOut, setSigningOut] = React.useState(false)

  // Initialize fields once profile details are loaded
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setCurrency(profile.currency || 'INR')
    }
  }, [profile])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    // Ensure we do not send empty name strings if the user tries to save an empty profile name
    // It's better to trim and fall back to empty string or prompt
    const trimmedName = fullName.trim()

    const { error } = await updateProfile({
      full_name: trimmedName || null,
      currency: currency,
    })

    setSaving(false)

    if (error) {
      setSaveError(error.message || 'Failed to update settings. Please try again.')
    } else {
      setSaveSuccess(true)
      // Hide success message after 4 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 4000)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.push('/')
    router.refresh()
  }

  // Fallbacks for avatar calculation
  const computedDisplayName = getDisplayName(profile, user)
  const avatarInitials = getInitials(computedDisplayName)

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal details, workspace preferences, and account security.
        </p>
      </div>

      {/* Profile Form Card */}
      <Card className="border border-border/80 bg-card/90 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">Profile Information</h2>
            <p className="text-xs text-muted-foreground">Update your identity and display name details.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-2xl font-semibold text-primary border border-primary/20">
                {avatarInitials}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Avatar Preview</p>
                <p className="text-xs text-muted-foreground">Derived from your initials.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name Input */}
            <div className="grid gap-1.5">
              <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-muted/15 border-border/50 focus-visible:ring-primary/40 h-10"
              />
            </div>

            {/* Read-only Email */}
            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="bg-muted/5 border-border/30 opacity-70 h-10 cursor-not-allowed select-none"
              />
              <span className="text-[11px] text-muted-foreground leading-normal">
                Managed through your sign-in account.
              </span>
            </div>
          </div>

          {/* Status Messages */}
          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-primary">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Your profile information has been successfully updated.</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex justify-end border-t border-border/50 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-medium px-5 shadow-lg shadow-primary/10"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving changes...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Financial Preferences Card */}
      <Card className="border border-border/80 bg-card/90 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Coins className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">Financial Preferences</h2>
            <p className="text-xs text-muted-foreground">Configure preferred display and calculation currency.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid gap-1.5 max-w-xs">
            <Label htmlFor="currency" className="text-xs font-medium text-muted-foreground">Preferred Currency</Label>
            <Select value={currency} onValueChange={(val) => setCurrency(val)}>
              <SelectTrigger className="bg-muted/15 border-border/50 focus:ring-primary/40 h-10 text-left">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/80 text-foreground">
                <SelectItem value="INR">INR (₹) — Indian Rupee</SelectItem>
                <SelectItem value="USD" disabled>USD ($) — US Dollar (Soon)</SelectItem>
                <SelectItem value="EUR" disabled>EUR (€) — Euro (Soon)</SelectItem>
                <SelectItem value="GBP" disabled>GBP (£) — British Pound (Soon)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
              INR is currently the fully supported display currency for transactions and dashboard charts. Additional currencies will be added in a future update.
            </p>
          </div>
        </div>
      </Card>

      {/* Account Control Card */}
      <Card className="border border-border/80 bg-card/90 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <Shield className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">Account Access & Security</h2>
            <p className="text-xs text-muted-foreground">Manage your credentials, authentication session, and privacy.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Sign out of your workspace</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your financial records remain private to your account.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSignOut}
            disabled={signingOut}
            className="h-10 font-medium px-4"
          >
            {signingOut ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="size-4 mr-2" />
                Sign out
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
