import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/authService';
import { useUser } from '../context/UserContext'; 

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { setUser } = useUser(); // Update global user state

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let data;
            if (isLogin) {
                data = await login({ email: formData.email, password: formData.password });
            } else {
                data = await register(formData);
            }
            
            setUser(data.user);
            alert(data.message || 'Thành công!');
            navigate('/'); // Chuyển về trang chủ sau khi thành công
            
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
                    {isLogin ? 'Đăng nhập' : 'Tạo tài khoản mới'}
                </h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="Nguyễn Văn A" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="0912345678" />
                            </div>
                        </>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field" placeholder="••••••••" minLength={6} />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3 text-lg shadow-blue-500/30 shadow-lg">
                        {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-gray-600">
                        {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                        <button 
                            type="button" 
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="ml-2 text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-all"
                        >
                            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;