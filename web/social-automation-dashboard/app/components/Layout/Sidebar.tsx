'use client';

import { 
  IconHome, 
  IconPlus, 
  IconBrandFacebook, 
  IconBrandInstagram,
  IconSettings,
  IconLogout
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { CreatePostModal } from '../CreatePostModal';

export function Sidebar() {
  const [createPostOpened, { open: openCreatePost, close: closeCreatePost }] = useDisclosure(false);

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-50 shadow-sm">
        <div className="flex flex-col items-center gap-2 flex-1 w-full">
          {/* Logo */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-1 shadow-sm">
            <span className="text-white font-bold text-xs">SM</span>
          </div>

          {/* Ana Menü */}
          <button
            className="w-12 h-12 p-0 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center justify-center group"
            title="Ana Sayfa"
          >
            <IconHome size={22} className="text-gray-600 group-hover:text-gray-900" />
          </button>

          <button
            onClick={openCreatePost}
            className="w-12 h-12 p-0 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all duration-200 flex items-center justify-center group"
            title="Yeni Gönderi"
          >
            <IconPlus size={22} className="text-primary-600 group-hover:text-primary-700" />
          </button>

          <div className="w-10 h-px bg-gray-200 my-3" />

          {/* Platformlar */}
          <button
            className="w-12 h-12 p-0 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center justify-center group"
            title="Facebook"
          >
            <IconBrandFacebook size={22} className="text-primary-600 group-hover:text-primary-700" />
          </button>

          <button
            className="w-12 h-12 p-0 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center justify-center group"
            title="Instagram"
          >
            <IconBrandInstagram size={22} className="text-instagram-purple group-hover:text-instagram-pink" />
          </button>

          <div className="flex-1" />

          {/* Alt Menü */}
          <button
            className="w-12 h-12 p-0 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center justify-center group"
            title="Ayarlar"
          >
            <IconSettings size={22} className="text-gray-600 group-hover:text-gray-900" />
          </button>

          <button
            className="w-12 h-12 p-0 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center justify-center group"
            title="Çıkış"
          >
            <IconLogout size={22} className="text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>
      </aside>

      <CreatePostModal opened={createPostOpened} onClose={closeCreatePost} />
    </>
  );
}
