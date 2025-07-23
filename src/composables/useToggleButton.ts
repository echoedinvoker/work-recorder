import { computed, ref } from "vue";

interface ShowForm {
  [formkey: string]: boolean;
}

const showForm = ref<ShowForm>({});

export function useToggleButton(formkey: string) {
  const toggleForm = () => {
    showForm.value[formkey] = !showForm.value[formkey];
  };

  const isFormVisible = () => {
    return !!showForm.value[formkey];
  };

  const formStatus = computed(() => {
    return showForm.value[formkey]
  });


  return {
    toggleForm,
    isFormVisible,
    formStatus
  };
}
