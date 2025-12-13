import { toast } from "sonner";

const showToast = (title: string, description?: string) => {
  toast(title, {
    description: description,
    action: {
      label: "Close",
      onClick: () => {
        toast.dismiss();
      },
    },
  });
};

export default showToast;
