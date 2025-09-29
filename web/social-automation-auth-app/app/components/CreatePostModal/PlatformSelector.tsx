/**
 * Platform Selector Component
 */

'use client';

import { Text, Checkbox, Group } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';

interface PlatformSelectorProps {
  platforms: string[];
  onPlatformToggle: (platform: string, checked: boolean) => void;
}

export function PlatformSelector({ platforms, onPlatformToggle }: PlatformSelectorProps) {
  return (
    <div>
      <Text className="text-sm font-medium text-gray-700 mb-2">Platformlar</Text>
      <div className="space-y-2">
        <Checkbox
          label={
            <Group gap="xs" className="ml-2">
              <IconBrandFacebook size={18} className="text-primary-600" />
              <Text className="text-sm text-gray-700">Facebook</Text>
            </Group>
          }
          checked={platforms.includes('facebook')}
          onChange={(e) => onPlatformToggle('facebook', e.currentTarget.checked)}
          className="[&_.mantine-Checkbox-input]:!border-border [&_.mantine-Checkbox-input:checked]:!bg-primary-600 [&_.mantine-Checkbox-input:checked]:!border-primary-600 [&_.mantine-Checkbox-input]:!m-0"
        />
        <Checkbox
          label={
            <Group gap="xs" className="ml-2">
              <IconBrandInstagram size={18} className="text-instagram-purple" />
              <Text className="text-sm text-gray-700">Instagram</Text>
            </Group>
          }
          checked={platforms.includes('instagram')}
          onChange={(e) => onPlatformToggle('instagram', e.currentTarget.checked)}
          className="[&_.mantine-Checkbox-input]:!border-border [&_.mantine-Checkbox-input:checked]:!bg-gradient-instagram [&_.mantine-Checkbox-input:checked]:!border-transparent [&_.mantine-Checkbox-input]:!m-0"
        />
      </div>
    </div>
  );
}
