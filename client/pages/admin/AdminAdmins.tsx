import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, UserX, X, ShieldCheck, Shield } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  deactivateAdmin,
  AdminMember,
} from "@/store/slices/adminAdminsSlice";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  superadmin: "Superadmin",
};

interface AdminForm {
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const emptyForm: AdminForm = {
  name: "",
  email: "",
  role: "admin",
  is_active: true,
};

export default function AdminAdmins() {
  const dispatch = useAppDispatch();
  const { admins, loading, saving } = useAppSelector((s) => s.adminAdmins);
  const currentAdmin = useAppSelector((s) => s.admin.admin);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminMember | null>(null);
  const [form, setForm] = useState<AdminForm>(emptyForm);

  useEffect(() => {
    dispatch(fetchAdmins());
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (a: AdminMember) => {
    setEditTarget(a);
    setForm({
      name: a.name,
      email: a.email,
      role: a.role,
      is_active: !!a.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      await dispatch(
        updateAdmin({
          id: editTarget.id,
          name: form.name,
          role: form.role as "admin" | "superadmin",
          is_active: form.is_active ? 1 : 0,
        }),
      );
    } else {
      await dispatch(
        createAdmin({
          name: form.name,
          email: form.email,
          role: form.role as "admin" | "superadmin",
        }),
      );
    }
    setModalOpen(false);
  };

  const handleDeactivate = (a: AdminMember) => {
    if (a.id === currentAdmin?.id) return;
    if (confirm(`¿Desactivar a ${a.name}? No podrá iniciar sesión.`)) {
      dispatch(deactivateAdmin(a.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-navy text-2xl">
            Administradores
          </h1>
          <p className="font-montserrat text-stone-gray text-sm mt-0.5">
            Gestión de acceso al panel
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-navy text-white font-montserrat text-sm px-4 py-2 rounded-sm hover:bg-opacity-90"
        >
          <Plus className="w-4 h-4" /> Nuevo admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm border border-stone-warm/30 overflow-hidden">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-navy border-t-sand rounded-full animate-spin" />
          </div>
        )}

        {!loading && admins.length === 0 && (
          <p className="text-center text-stone-gray font-montserrat text-sm py-12">
            Sin administradores
          </p>
        )}

        {/* Header row */}
        {!loading && admins.length > 0 && (
          <div className="hidden sm:grid grid-cols-[1fr_1fr_130px_90px_100px] gap-4 px-5 py-2 border-b border-stone-warm/20 bg-stone-light/50">
            {["Nombre", "Correo", "Rol", "Estado", "Acciones"].map((h) => (
              <p
                key={h}
                className="font-montserrat text-xs text-stone-gray uppercase tracking-wide"
              >
                {h}
              </p>
            ))}
          </div>
        )}

        {!loading &&
          admins.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex flex-col sm:grid sm:grid-cols-[1fr_1fr_130px_90px_100px] gap-2 sm:gap-4 px-5 py-3 border-b border-stone-warm/20 last:border-0 items-start sm:items-center ${
                !a.is_active ? "opacity-50" : ""
              }`}
            >
              {/* Name */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-montserrat text-xs font-semibold text-navy">
                    {a.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-montserrat font-medium text-navy text-sm">
                    {a.name}
                  </p>
                  {a.id === currentAdmin?.id && (
                    <p className="font-montserrat text-xs text-sand">Tú</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <p className="font-montserrat text-xs text-stone-gray sm:truncate">
                {a.email}
              </p>

              {/* Role */}
              <div className="flex items-center gap-1.5">
                {a.role === "superadmin" ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-sand" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-stone-gray" />
                )}
                <span className="font-montserrat text-xs text-navy">
                  {ROLE_LABELS[a.role] ?? a.role}
                </span>
              </div>

              {/* Status */}
              <span
                className={`text-xs font-montserrat px-2 py-0.5 rounded-full border ${
                  a.is_active
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-400 border-gray-200"
                }`}
              >
                {a.is_active ? "Activo" : "Inactivo"}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(a)}
                  className="p-1.5 text-stone-gray hover:text-navy hover:bg-stone-light rounded-sm transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {a.id !== currentAdmin?.id && a.is_active && (
                  <button
                    onClick={() => handleDeactivate(a)}
                    className="p-1.5 text-stone-gray hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                    title="Desactivar"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white rounded-sm w-full max-w-md"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-warm/20">
                <h3 className="font-montserrat font-semibold text-navy">
                  {editTarget ? "Editar administrador" : "Nuevo administrador"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-stone-gray hover:text-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="label-admin">Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="input-admin"
                  />
                </div>

                {!editTarget && (
                  <div>
                    <label className="label-admin">Correo electrónico *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                      className="input-admin"
                    />
                  </div>
                )}

                <div>
                  <label className="label-admin">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input-admin"
                  >
                    <option value="admin">Administrador</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                {editTarget && editTarget.id !== currentAdmin?.id && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                      className="w-4 h-4 accent-navy"
                    />
                    <span className="font-montserrat text-sm text-navy">
                      Cuenta activa
                    </span>
                  </label>
                )}

                {!editTarget && (
                  <p className="font-montserrat text-xs text-stone-gray bg-stone-light/50 px-3 py-2 rounded-sm">
                    El administrador recibirá un OTP por correo la primera vez
                    que inicie sesión.
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 border border-stone-warm text-navy font-montserrat text-sm py-2 rounded-sm hover:bg-stone-light"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-navy text-white font-montserrat text-sm py-2 rounded-sm hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .label-admin { display:block; font-family:var(--font-montserrat,sans-serif); font-size:11px; font-weight:500; color:#2E3447; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px; }
        .input-admin { width:100%; border:1px solid #D9D6D1; border-radius:2px; padding:8px 12px; font-family:var(--font-montserrat,sans-serif); font-size:13px; color:#2E3447; background:#fff; outline:none; transition:border-color 0.15s; }
        .input-admin:focus { border-color:#2E3447; }
      `}</style>
    </div>
  );
}
