"use client";

import { useEffect, useState } from "react";

const EditButton = () => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  useEffect(() => {
    document.body.contentEditable = isEdit ? "true" : "inherit";
  }, [isEdit]);
  return (
    <button onClick={() => setIsEdit((p) => !p)} className="btn">
      {!isEdit ? "edit mode" : "normal mode"}
    </button>
  );
};

export default EditButton;
