// Este arquivo é utilizado pelo saas_default_pages, para que ao clicar no botão "Editar parametros"
// de um arquivo listado, executar a ação abaixo

export const onEditParamsListPages = async ({
    fileData,
    id,
    routes,
    readOnly,
    navigate,
    setIsModalProjectForm,
    setDynamicChildrenData,
}) => {
    navigate(`/architectural-program/${id}/new-solutions`, { replace: true, relative: '.' })
};
