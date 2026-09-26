import { useState, useCallback, useMemo } from 'react';

const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value, allValues) => {
    if (validationRules[name]) {
      const error = validationRules[name](value, allValues);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
      return error;
    }
    return null;
  }, [validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    let newValue = value;
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      newValue = files;
    }

    setFormValues(prev => {
      const nextValues = { ...prev, [name]: newValue };
      if (touched[name]) {
        validateField(name, newValue, nextValues);
      }
      return nextValues;
    });
  }, [touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value, values);
  }, [validateField, values]);

  const setValue = useCallback((name, value) => {
    setFormValues(prev => {
      const nextValues = { ...prev, [name]: value };
      if (touched[name]) {
        validateField(name, value, nextValues);
      }
      return nextValues;
    });
  }, [touched, validateField]);

  const setValues = useCallback((newValues) => {
    setFormValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    const newTouched = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      newTouched[key] = true;
      const error = validationRules[key](values[key], values);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return isValid;
  }, [validationRules, values]);

  const reset = useCallback(() => {
    setFormValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(err => err === null || err === undefined);
  }, [errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValue,
    setValues,
    validate,
    reset,
    isValid,
    isDirty
  };
};

export default useForm;
