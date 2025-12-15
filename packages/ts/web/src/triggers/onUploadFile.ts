import { CheckCircleAlertIcon } from 'saas_root/Icons';
import { AlertModalInterface } from '../containers/LayoutSolutions/LayoutSolutions.types'

interface OnUploadFileProps {
  siteId: string;
  setUploadFileIsOpen: (value: { open: boolean }) => void;
  getSiteById: (siteId: string) => Promise<void>;
  navigate: (path: string) => void;
  setAlertModalIsOpen: (alert: AlertModalInterface) => void;
}

export const onUploadFile = ({
  siteId,
  setUploadFileIsOpen,
  getSiteById,
  navigate,
  setAlertModalIsOpen,
}: OnUploadFileProps) => {
  getSiteById(siteId).then(() => {
    setAlertModalIsOpen({
      open: true,
      submitDangerous: false,
      title: 'Projeto criado com sucesso!',
      description: 'Agora só precisamos configurar os ambientes.',
      icon: CheckCircleAlertIcon,
      textSubmit: 'Continuar',
      textCancel: 'Fechar',
      onCancel: () => setUploadFileIsOpen({ open: false }),
      onSubmit: () => {
        navigate(`/layouts/${siteId}/new-solutions`);
        setUploadFileIsOpen({ open: false });
      },
    });
  });
};
