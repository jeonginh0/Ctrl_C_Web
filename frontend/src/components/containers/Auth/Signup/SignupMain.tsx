import React, { useState } from 'react';
import SuccessMessage from '@/components/common/messages/SuccessMessage';
import styles from '@/styles/Signup.module.css';
import apiClient from '../../../../ApiClient';
import Modal from '@/components/common/modals/Modal';
import Button from '@/components/common/inputs/Button';
import buttons from '@/styles/Button.module.css';

// 폼 데이터 인터페이스 정의
interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode?: string;
}

// 폼 에러 인터페이스 정의
interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  verificationCode?: string;
}

const SignupMain = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // 폼 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 이메일 유효성 검사
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (isSuccess && modalMessage === '회원가입이 성공적으로 완료되었습니다!') {
      window.location.href = '/login';
    }
  };

  // 인증번호 요청
  const sendVerification = async () => {
    if (!validateEmail(formData.email)) {
      setErrors({ ...errors, email: '유효한 이메일 주소를 입력해주세요.' });
      return;
    }

    try {
      await apiClient.post('/auth/send-verification-code', {
        email: formData.email,
      });

      setVerificationSent(true);
      setErrors({ ...errors, email: undefined });
      setModalMessage('인증 코드가 이메일로 전송되었습니다.');
      setIsSuccess(true);
      setShowModal(true);
    } catch (error) {
      setModalMessage('인증 코드 전송에 실패했습니다.');
      setIsSuccess(false);
      setShowModal(true);
    }
  };

  // 인증번호 확인 요청
  const handleVerification = async () => {
    try {
      const response = await apiClient.post('/auth/verify-verification-code', {
        email: formData.email,
        verificationCode: formData.verificationCode,
      });

      if (response.status === 200 || response.status === 201) {
        setIsVerified(true);
        setModalMessage('인증이 성공적으로 완료되었습니다!');
        setIsSuccess(true);
        setShowModal(true);
      } else {
        throw new Error('잘못된 인증번호입니다.');
      }
    } catch (error) {
      setErrors({ ...errors, verificationCode: '잘못된 인증번호입니다.' });
      setModalMessage('잘못된 인증번호입니다.');
      setIsSuccess(false);
      setShowModal(true);
    }
  };

  // 회원가입 요청
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: FormErrors = {};
    if (!formData.username.trim()) newErrors.username = '닉네임을 입력해주세요.';
    if (!formData.email.trim()) newErrors.email = '이메일을 입력해주세요.';
    if (!validateEmail(formData.email)) newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
    if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    if (!formData.verificationCode) newErrors.verificationCode = '인증번호를 입력해주세요.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!isVerified) {
      setModalMessage('이메일 인증을 완료해주세요.');
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    try {
      const response = await apiClient.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        verificationCode: formData.verificationCode,
      });

      setModalMessage('회원가입이 성공적으로 완료되었습니다!');
      setIsSuccess(true);
      setShowModal(true);
    } catch (error) {
      setModalMessage('회원가입에 실패했습니다.');
      setIsSuccess(false);
      setShowModal(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>회원가입</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">이름*</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="예) 정레디"
              className={errors.username ? styles.inputError : ''}
            />
            {errors.username && <p className={styles.errorText}>{errors.username}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">이메일 주소*</label>
            <div className={styles.emailVerification}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="예) renalyze@renalyze.com"
                className={errors.email ? styles.inputError : ''}
              />
              <button
                type="button"
                className={styles.verificationButton}
                onClick={sendVerification}
              >
                인증번호 전송
              </button>
            </div>
            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          </div>

          {verificationSent && (
            <div className={styles.formGroup}>
              <label htmlFor="verificationCode">인증번호 확인*</label>
              <div className={styles.emailVerification}>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  placeholder="인증번호 입력"
                  onChange={handleChange}
                  className={errors.verificationCode ? styles.inputError : ''}
                />
                <button
                  type="button"
                  className={styles.verificationButton}
                  onClick={handleVerification}
                >
                  인증번호 확인
                </button>
              </div>
              {errors.verificationCode && (
                <p className={styles.errorText}>{errors.verificationCode}</p>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="password">비밀번호*</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="영문, 숫자, 특수문자 조합 8~16자"
              className={errors.password ? styles.inputError : ''}
            />
            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">비밀번호 확인*</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="영문, 숫자, 특수문자 조합 8~16자"
              className={errors.confirmPassword ? styles.inputError : ''}
            />
            {errors.confirmPassword && (
              <p className={styles.errorText}>{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>
            회원가입
          </button>
        </form>

        {showModal && (
          <Modal>
            <div className={styles.modalContent}>
              <p className={isSuccess ? styles.successText : styles.errorText}>
                {modalMessage}
              </p>
              <Button 
                onClick={handleCloseModal} 
                className={isSuccess ? buttons.confirmButton : buttons.cancelButton}
              >
                확인
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default SignupMain;
