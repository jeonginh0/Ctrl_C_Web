import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import apiClient from '@/ApiClient';

export default function AnalysisResult() {
    const router = useRouter();
    const { id } = router.query; 
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchAnalysis = async () => {
            try {
                const response = await apiClient.get(`/analysis/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setAnalysisData(response.data);
            } catch (err) {
                setError('분석 결과를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [id]);

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>분석 결과</h1>
            <pre>{JSON.stringify(analysisData, null, 2)}</pre>
        </div>
    );
}
