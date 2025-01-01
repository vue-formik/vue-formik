import useFormik from "@/composables/useFormik";
import FormTextArea from "@/components/FormTextArea.vue";
import FormTextField from "@/components/FormInput.vue";
import FormSelectField from "@/components/FormSelectField.vue";
import FormContentEditable from "@/components/FormContentEditable.vue";

const FormField = {
  Input: FormTextArea,
  TextArea: FormTextField,
  Select: FormSelectField,
  ContentEditable: FormContentEditable,
};

export { useFormik, FormTextArea, FormTextField, FormSelectField, FormContentEditable, FormField };
