export const onOpenGeneratedSolution = ({ solutionId, siteId, navigate }) => {
    navigate(`/layouts/${siteId}/solutions/${solutionId}`);
};
