import { formatValue } from "saas_root/Utils";

export const factoryCardSolution = (data, id) => {
    return data.map((solution) => {
        const template = [
            {
                typeValue: undefined,
                title: 'Área total',
                value: `${formatValue(solution?.data?.processed_info?.find(item => item?.type === "TotalArea")?.value)} m²`,
            },
        ];

        const solutionData = {
            titleInfo: 'Índices alcançados',
            solutionId: solution.id,
            solutionName: solution.name,
            totalScore: solution.scores.total,
            data: template,
            favorited: Boolean(solution.favoritedBy.find((user) => user === id)),
            updatedAt: solution.updatedAt,
            archprog: solution.data.archprog,
        };

        return solutionData;
    });
};
