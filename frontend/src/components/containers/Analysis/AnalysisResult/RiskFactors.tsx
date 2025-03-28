import React from 'react';

type RiskFactorsProps = {
    riskFactors: string | null;
};

const RiskFactors: React.FC<RiskFactorsProps> = ({ riskFactors }) => {
    return (
        <div className="warningBox">
           <p>{riskFactors}</p>
        </div>
    );
};

export default RiskFactors;
