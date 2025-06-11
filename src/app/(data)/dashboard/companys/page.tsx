"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyDetail } from "@/generated/prisma";
import {
  AddCompany,
  deleteCompany,
  getAllCompany,
  updateCompany,
} from "@/action/company";
import { slipDetailsSchema } from "../mis/_utils/schema";

// Schema
const companySchema = z.object({
  shotName: z.string().min(2, "Short name is required"),
  name: z.string().min(2, "Name is required"),
  billingAddress: z.string().min(2, "Billing address is required"),
  gstNo: z.string().min(2, "GST number is required"),
  shippingAddress: z.string().min(2, "Shipping address is required"),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyTable() {
  const [companies, setCompanies] = useState<companyDetail[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<companyDetail | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const updateData = async () => {
    const data = await getAllCompany();
    setCompanies(data);
  };
  const openFormModal = (company: companyDetail | null = null) => {
    setIsEditing(!!company);
    setSelectedCompany(company);
    reset(
      company ?? {
        shotName: "",
        name: "",
        billingAddress: "",
        gstNo: "",
        shippingAddress: "",
      }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = async (data: CompanyFormData) => {
    if (isEditing && selectedCompany) {
      updateCompany(selectedCompany.id, data);
      await updateData();
    } else {
      await AddCompany({
        ...data,
      });
      await updateData();
    }
    closeModal();
  };

  const confirmDelete = (company: companyDetail) => {
    setSelectedCompany(company);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (selectedCompany) {
      await deleteCompany(selectedCompany.id);
      await updateData();
      //   setCompanies((prev) => prev.filter((c) => c.id !== selectedCompany.id));
    }
    setIsDeleteConfirmOpen(false);
  };
  useEffect(() => {
    (async () => {
      await updateData();
    })();
  }, []);
  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Companies</h1>
        <button className="btn btn-primary" onClick={() => openFormModal()}>
          ➕ Add Company
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Shot Name</th>
              <th>Name</th>
              <th>Billing Address</th>
              <th>GST No</th>
              <th>Shipping Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>{company.shotName}</td>
                <td>{company.name}</td>
                <td>{company.billingAddress}</td>
                <td>{company.gstNo}</td>
                <td>{company.shippingAddress}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => openFormModal(company)}
                    >
                      Update
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => confirmDelete(company)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Update Modal */}
      {isModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {isEditing ? "Update" : "Add"} Company
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {[
                { name: "shotName", label: "Short Name" },
                { name: "name", label: "Name" },
                { name: "billingAddress", label: "Billing Address" },
                { name: "gstNo", label: "GST Number" },
                { name: "shippingAddress", label: "Shipping Address" },
              ].map(({ name, label }) => (
                <div key={name} className="form-control">
                  <label className="label">
                    <span className="label-text">{label}</span>
                  </label>
                  <input
                    {...register(name as keyof CompanyFormData)}
                    className="input input-bordered w-full"
                  />
                  {errors[name as keyof CompanyFormData] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[name as keyof CompanyFormData]?.message}
                    </p>
                  )}
                </div>
              ))}
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button type="button" className="btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-2">
              Are you sure you want to delete{" "}
              <strong>{selectedCompany?.name}</strong>?
            </p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDelete}>
                Delete
              </button>
              <button
                className="btn"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
