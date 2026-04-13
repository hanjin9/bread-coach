import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

export type PaymentMethod = 'naver' | 'kakao' | 'toss' | 'mobile' | 'card';

interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
  features: string[];
  color: string;
}

const paymentMethods: PaymentMethodInfo[] = [
  {
    id: 'naver',
    name: '네이버 페이',
    icon: '🔵',
    description: '네이버 아이디 연동, 포인트 적립',
    features: ['포인트 적립', '빠른 결제', '안전한 거래'],
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'kakao',
    name: '카카오 페이',
    icon: '💛',
    description: '카카오톡 앱 내 즉시 결제',
    features: ['QR 결제', '생체인증', '즉시 결제'],
    color: 'from-yellow-400 to-yellow-500',
  },
  {
    id: 'toss',
    name: '토스 페이',
    icon: '🔵',
    description: '간편 송금 기반 초고속 결제',
    features: ['초고속', '간편', '실시간'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'mobile',
    name: '휴대폰 결제',
    icon: '📱',
    description: '통신사 연동, 소액 결제 최적화',
    features: ['소액결제', '통신사 연동', '자동 청구'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'card',
    name: '신용카드',
    icon: '💳',
    description: '국내 모든 카드사 ISP 연동',
    features: ['모든 카드사', 'ISP 보안', '할부 가능'],
    color: 'from-red-500 to-red-600',
  },
];

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
  amount: number;
}

export default function PaymentMethodSelector({
  onSelect,
  selectedMethod,
  amount,
}: PaymentMethodSelectorProps) {
  const { t } = useLanguage();
  const [hoveredMethod, setHoveredMethod] = useState<PaymentMethod | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* 결제 금액 표시 */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg">
        <p className="text-sm opacity-90 mb-2">결제 금액</p>
        <h2 className="text-4xl font-bold">
          ₩{amount.toLocaleString('ko-KR')}
        </h2>
      </div>

      {/* 결제 수단 선택 */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800">결제 수단을 선택하세요</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              className={`p-4 cursor-pointer transition-all duration-300 ${
                selectedMethod === method.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              } ${hoveredMethod === method.id ? 'scale-105' : ''}`}
              onClick={() => onSelect(method.id)}
              onMouseEnter={() => setHoveredMethod(method.id)}
              onMouseLeave={() => setHoveredMethod(null)}
            >
              <div className="flex items-start gap-4">
                {/* 아이콘 */}
                <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${method.color} text-white`}>
                  {method.icon}
                </div>

                {/* 정보 */}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">{method.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>

                  {/* 특징 */}
                  <div className="flex flex-wrap gap-2">
                    {method.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 선택 표시 */}
                {selectedMethod === method.id && (
                  <div className="text-blue-500 text-2xl">✓</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 선택된 결제 수단 정보 */}
      {selectedMethod && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">
              {paymentMethods.find((m) => m.id === selectedMethod)?.icon}
            </span>
            <div>
              <h4 className="font-bold text-gray-800">
                {paymentMethods.find((m) => m.id === selectedMethod)?.name}
              </h4>
              <p className="text-sm text-gray-600">
                {paymentMethods.find((m) => m.id === selectedMethod)?.description}
              </p>
            </div>
          </div>

          {/* 결제 버튼 */}
          <Button
            onClick={() => {
              // 결제 처리 로직
              console.log(`Processing payment with ${selectedMethod}`);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all"
          >
            ₩{amount.toLocaleString('ko-KR')} 결제하기
          </Button>
        </Card>
      )}

      {/* 보안 정보 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          🔒 모든 결제는 암호화되어 안전하게 처리됩니다.
        </p>
      </div>
    </div>
  );
}
