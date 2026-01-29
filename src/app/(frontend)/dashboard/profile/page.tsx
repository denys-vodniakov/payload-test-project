'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  Camera,
  Save,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AnimatedBackground from '@/components/AnimatedBackground'
import GlassCard from '@/components/GlassCard'
import GradientText from '@/components/GradientText'

export default function ProfilePage() {
  const { user, updateProfile, updateAvatar, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    company: user?.company || '',
    position: user?.position || '',
  })
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await updateProfile(formData)

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarLoading(true)
    setMessage(null)

    try {
      const result = await updateAvatar(file)

      if (result.success) {
        setMessage({ type: 'success', text: 'Avatar updated successfully!' })
        await refreshUser()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update avatar' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setAvatarLoading(false)
    }
  }

  const getAvatarUrl = () => {
    if (user?.avatar && typeof user.avatar === 'object' && 'url' in user.avatar) {
      return user.avatar.url
    }
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative transition-colors duration-300">
        <AnimatedBackground />

        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <nav className="mb-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </nav>
            <GradientText className="text-4xl font-bold mb-2 block">Profile Settings</GradientText>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6">
                <CardHeader className="text-center p-0 mb-4">
                  <CardTitle className="text-lg">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col items-center">
                    <div
                      className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 mb-4 cursor-pointer group"
                      onClick={handleAvatarClick}
                    >
                      {getAvatarUrl() ? (
                        <img
                          src={getAvatarUrl()!}
                          alt={user?.name || 'Avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {avatarLoading ? (
                          <Loader2 className="h-8 w-8 text-white animate-spin" />
                        ) : (
                          <Camera className="h-8 w-8 text-white" />
                        )}
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Click to upload a new photo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, GIF or WebP. Max 5MB.
                    </p>
                  </div>

                  {/* User Info */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        {user?.email}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        Member since{' '}
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <GlassCard className="p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl">Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details here
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        disabled={loading}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        disabled={loading}
                      />
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                      <Label htmlFor="company" className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Company / Organization
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Your company name"
                        disabled={loading}
                      />
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                      <Label htmlFor="position" className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Job Title / Position
                      </Label>
                      <Input
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder="Software Engineer"
                        disabled={loading}
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Bio
                      </Label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        disabled={loading}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {/* Message */}
                    {message && (
                      <div
                        className={`p-3 rounded-lg ${
                          message.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {message.text}
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
