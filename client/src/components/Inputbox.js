import React from "react";

const Inputbox = ({
  label,
  name,
  type,
  isRequired = false,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <>
      <label htmlFor="email">{label}</label>
      <input
        name={name}
        type={type}
        required={isRequired}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </>
  );
};

export default Inputbox;
