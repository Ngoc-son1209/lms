import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function VerifyStatus() {
  const navigate = useNavigate();
  const location = useLocation();

  const success = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('success') === 'true';
  }, [location.search]);

  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleGoLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 480, padding: 24, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}>
        <h2 style={{ margin: 0, marginBottom: 8, fontSize: 22 }}>
          {success ? 'Xác thực thành công' : 'Xác thực thất bại'}
        </h2>

        <p style={{ marginTop: 0, marginBottom: 16, color: '#4b5563', lineHeight: 1.5 }}>
          {success
            ? 'Tài khoản của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.'
            : 'Liên kết xác thực không hợp lệ hoặc đã được sử dụng. Vui lòng đăng ký lại hoặc yêu cầu gửi lại email xác thực.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button
            onClick={handleGoLogin}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: 'none',
              background: '#111827',
              color: '#fff',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Về trang đăng nhập
          </button>

          <div style={{ color: '#6b7280', fontSize: 14 }}>
            Tự chuyển hướng sau {secondsLeft}s
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyStatus;

