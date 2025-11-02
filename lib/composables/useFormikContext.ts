import { inject, computed } from "vue";
import type { Formik } from "@/types";

export function useFormikContext(pFormik?: Formik) {
  const injectedFormik = inject<Formik | null>("formik", null);

  const formik = computed(() => {
    const formikInstance = pFormik || injectedFormik;
    if (!formikInstance) {
      console.error("No Formik instance provided via injection or props");
      return null;
    }
    return formikInstance;
  });

  return { formik: formik.value };
}

export default useFormikContext;
