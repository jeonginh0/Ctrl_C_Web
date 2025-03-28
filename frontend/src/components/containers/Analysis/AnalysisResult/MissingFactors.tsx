import React from 'react';

type MissingFactorsProps = {
    missingFactors: string | null;
};

const MissingFactors: React.FC<MissingFactorsProps> = ({ missingFactors }) => {
    return (
        <div className="errorBox">
            <p>{missingFactors}</p>
        </div>
    );
};

export default MissingFactors;
