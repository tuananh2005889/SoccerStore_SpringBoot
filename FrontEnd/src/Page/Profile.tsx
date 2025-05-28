// src/pages/Profile.jsx

import React, { useState } from 'react'
import Navbar from '../Homepage/Navbar'
import {
  FiUser, FiCalendar, FiLock,
  FiShoppingBag, FiEdit, FiCheck, FiX
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useUser, User } from '../context/UserContext'
import toast from 'react-hot-toast'

type FormData = {
  fullName: string;
  gmail: string;
  phone: string;
  address: string;
};

type PasswordData = {
  newPassword: string;
  confirmPassword: string;
};

const Profile: React.FC = () => {
  const { user, loading, updateUserInfo, updateAvatar, updatePassword } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    gmail: '',
    phone: '',
    address: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize form data when user data is loaded
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        gmail: user.gmail,
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset form data if canceling
      setFormData({
        fullName: user?.fullName || '',
        gmail: user?.gmail || '',
        phone: user?.phone || '',
        address: user?.address || ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      if (user) {
        const updates: Partial<User> = {};
        if (formData.fullName !== user.fullName) updates.fullName = formData.fullName;
        if (formData.gmail !== user.gmail) updates.gmail = formData.gmail;
        if (formData.phone !== user.phone) updates.phone = formData.phone;
        if (formData.address !== user.address) updates.address = formData.address;

        if (Object.keys(updates).length > 0) {
          await updateUserInfo(updates);
        }
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Profile: Error saving changes:', err);
    }
  };

  const handleAvatarEdit = () => {
    const url = prompt('Nhập URL ảnh đại diện mới');
    if (!url) return;
    updateAvatar(url).catch(console.error);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await updatePassword(passwordData.newPassword);
      setShowPasswordForm(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Profile: Error updating password:', err);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="h-16" />
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"/>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-16"/>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gray-100 p-6 flex flex-col items-center">
            <div className="relative">
              <img
                src={user.avatarUrl || user.avatar || ''}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <button
                onClick={handleAvatarEdit}
                className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
                <FiEdit className="w-5 h-5"/>
              </button>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-gray-600">{user.gmail}</p>
            <p className="text-sm text-gray-500 mt-1">
              <FiCalendar className="inline mr-1"/>
              {user.joinDate || 'Tham gia từ tháng 3, 2023'}
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            {/* Personal Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FiUser className="mr-2 text-green-600"/> Thông tin cá nhân
                  </h2>
                  <div className="space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                          <FiCheck className="inline mr-1"/> Lưu
                        </button>
                        <button
                          onClick={handleEditToggle}
                          className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">
                          <FiX className="inline mr-1"/> Hủy
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditToggle}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        <FiEdit className="inline mr-1"/> Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600">Họ tên:</span>
                    {isEditing ? (
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="flex-1 border rounded p-2"
                      />
                    ) : (
                      <span className="flex-1 font-medium">{user.fullName}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600">Email:</span>
                    {isEditing ? (
                      <input
                        name="gmail"
                        value={formData.gmail}
                        onChange={handleChange}
                        className="flex-1 border rounded p-2"
                      />
                    ) : (
                      <span className="flex-1 font-medium">{user.gmail}</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600">Điện thoại:</span>
                    {isEditing ? (
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="flex-1 border rounded p-2"
                      />
                    ) : (
                      <span className="flex-1 font-medium">
                        {user.phone || 'Chưa cập nhật'}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-start">
                    <span className="w-32 text-gray-600">Địa chỉ:</span>
                    {isEditing ? (
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="flex-1 border rounded p-2"
                      />
                    ) : (
                      <span className="flex-1 font-medium">
                        {user.address || 'Chưa cập nhật'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FiLock className="mr-2 text-green-600"/> Bảo mật
                </h2>
                {!showPasswordForm ? (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    onClick={() => setShowPasswordForm(true)}>
                    Đổi mật khẩu
                  </button>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Mật khẩu mới"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full border rounded p-2"/>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full border rounded p-2"/>
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        onClick={handlePasswordSave}>
                        Lưu
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                        onClick={() => setShowPasswordForm(false)}>
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity & Menu */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <FiShoppingBag className="mr-2 text-green-600"/> Hoạt động
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span>Đơn hàng đã mua</span>
                    <span className="font-bold text-green-600">{user.orders || 0}</span>
                  </div>
                  <Link to="/orders" className="block p-4 hover:bg-gray-50 rounded-lg">Lịch sử đơn hàng</Link>
                  <Link to="/wishlist" className="block p-4 hover:bg-gray-50 rounded-lg">Sản phẩm yêu thích</Link>
                  <Link to="/settings" className="block p-4 hover:bg-gray-50 rounded-lg">Cài đặt tài khoản</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
