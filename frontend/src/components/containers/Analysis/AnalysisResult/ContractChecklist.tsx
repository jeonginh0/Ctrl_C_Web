import React from 'react';

type ContractChecklistProps = {
    checklist: Record<string, any>;
};

const ContractChecklist: React.FC<ContractChecklistProps> = ({ checklist }) => {
    return (
        <div>
            <pre>{JSON.stringify(checklist, null, 2)}</pre>
        </div>
    );
};

export default ContractChecklist;
