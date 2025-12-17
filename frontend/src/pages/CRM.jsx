import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Phone, Mail, Calendar, TrendingUp, MessageSquare, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const CRM = () => {
  const navigate = useNavigate();
  const [stats] = useState({
    totalCustomers: 1247,
    activeCalls: 89,
    pendingTickets: 34,
    monthlyRevenue: '₺487,250'
  });

  const [recentCustomers] = useState([
    { id: 1, name: 'Ahmet Yıldız', company: 'Tech Corp', email: 'ahmet@techcorp.com', phone: '0532 123 45 67', status: 'active' },
    { id: 2, name: 'Ayşe Demir', company: 'Media Plus', email: 'ayse@mediaplus.com', phone: '0533 234 56 78', status: 'active' },
    { id: 3, name: 'Mehmet Kaya', company: 'Retail Group', email: 'mehmet@retail.com', phone: '0534 345 67 89', status: 'pending' },
    { id: 4, name: 'Zeynep Aydın', company: 'Finance Co', email: 'zeynep@finance.com', phone: '0535 456 78 90', status: 'active' },
    { id: 5, name: 'Ali Veli', company: 'Logistics Ltd', email: 'ali@logistics.com', phone: '0536 567 89 01', status: 'inactive' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2" size={20} />
                Ana Sayfa
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">CRM Paneli</h1>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-bold">
              Velora
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Müşteri</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif Çağrılar</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeCalls}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Phone className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bekleyen Talepler</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingTickets}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <MessageSquare className="text-orange-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aylık Gelir</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.monthlyRevenue}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Son Müşteriler</CardTitle>
            <CardDescription>En son kaydedilen müşteri bilgileri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ad Soyad</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Şirket</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">E-posta</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefon</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{customer.name}</td>
                      <td className="py-3 px-4">{customer.company}</td>
                      <td className="py-3 px-4">
                        <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                          {customer.email}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                          {customer.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : customer.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {customer.status === 'active'
                            ? 'Aktif'
                            : customer.status === 'pending'
                            ? 'Bekliyor'
                            : 'Pasif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRM;
