"use client"

import * as React from "react"
import { useProfileSettings } from "@/hooks/settings/use-profile-settings"
import { usePasswordChange } from "@/hooks/settings/use-password-change"
import { SettingsProfileInfoCard } from "./settings-profile-info-card"
import { SettingsPasswordCard } from "./settings-password-card"

export function SettingsProfileTab() {
  const {
    user,
    name,
    setName,
    avatar,
    setAvatar,
    savingProfile,
    handleSaveProfile,
  } = useProfileSettings()

  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    savingPassword,
    handleChangePassword,
  } = usePasswordChange()

  return (
    <div className="flex flex-col gap-6">
      <SettingsProfileInfoCard
        email={user?.email}
        name={name}
        setName={setName}
        avatar={avatar}
        setAvatar={setAvatar}
        savingProfile={savingProfile}
        onSaveProfile={handleSaveProfile}
      />

      <SettingsPasswordCard
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        savingPassword={savingPassword}
        onChangePassword={handleChangePassword}
      />
    </div>
  )
}
