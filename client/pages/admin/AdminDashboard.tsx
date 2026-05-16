import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MessageSquare,
  Building2,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createAsyncThunk } from "@reduxjs/toolkit";
import adminAxios from "@/store/axiosAdmin";
import { useState } from "react";

interface DashboardData {
  stats: {
    visits_today: number;
    visits_pending: number;
    visits_confirmed: number;
    visits_this_month: number;
    contacts_new: number;
    contacts_total: number;
    models_available: number;
    models_sold: number;
  };
  upcoming_visits: {
    id: number;
    visitor_name: string;
    visitor_email: string;
    visit_date: string;
    time_start: string;
    time_end: string;
    status: string;
    visitor_interest: string;
    booking_reference: string;
  }[];
  recent_contacts: {
    id: number;
    name: string;
    email: string;
    phone: string;
    interest: string;
    status: string;
    created_at: string;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-blue-100 text-blue-700",
  new: "bg-sand/20 text-sand-light",
  read: "bg-gray-100 text-gray-500",
  contacted: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Completado",
  new: "Nuevo",
  read: "Leído",
  contacted: "Contactado",
  archived: "Archivado",
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAxios
      .get("/api/admin/dashboard.php")
      .then((r) => {
        setData(r.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-navy border-t-sand rounded-full animate-spin" />
      </div>
    );
  }

  const s = data?.stats;

  const statCards = [
    {
      label: "Visitas hoy",
      value: s?.visits_today ?? 0,
      icon: CalendarDays,
      color: "text-navy",
      bg: "bg-navy/5",
      link: "/admin/visitas",
    },
    {
      label: "Pendientes",
      value: s?.visits_pending ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      link: "/admin/visitas",
    },
    {
      label: "Contactos nuevos",
      value: s?.contacts_new ?? 0,
      icon: MessageSquare,
      color: "text-sand",
      bg: "bg-sand/10",
      link: "/admin/contactos",
    },
    {
      label: "Modelos disponibles",
      value: s?.models_available ?? 0,
      icon: Building2,
      color: "text-green-600",
      bg: "bg-green-50",
      link: "/admin/modelos",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-montserrat font-bold text-navy text-2xl md:text-3xl">
          Dashboard
        </h1>
        <p className="font-montserrat text-stone-gray text-sm mt-1">
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={card.link}
              className="block bg-white rounded-sm border border-stone-warm/30 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div
                className={`w-10 h-10 ${card.bg} rounded-sm flex items-center justify-center mb-3`}
              >
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="font-montserrat text-stone-gray text-xs uppercase tracking-wide mb-1">
                {card.label}
              </p>
              <p className={`font-montserrat font-bold text-3xl ${card.color}`}>
                {card.value}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Este mes",
            value: s?.visits_this_month ?? 0,
            sub: "visitas totales",
          },
          {
            label: "Confirmadas",
            value: s?.visits_confirmed ?? 0,
            sub: "por llegar",
          },
          {
            label: "Total contactos",
            value: s?.contacts_total ?? 0,
            sub: "acumulados",
          },
          { label: "Vendidos", value: s?.models_sold ?? 0, sub: "modelos" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-sm border border-stone-warm/20 px-4 py-3"
          >
            <p className="font-montserrat font-bold text-navy text-xl">
              {item.value}
            </p>
            <p className="font-montserrat text-xs text-navy/70 font-medium">
              {item.label}
            </p>
            <p className="font-montserrat text-xs text-stone-gray">
              {item.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming visits */}
        <div className="bg-white rounded-sm border border-stone-warm/30 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-warm/20 flex items-center justify-between">
            <h2 className="font-montserrat font-semibold text-navy text-sm">
              Próximas visitas (7 días)
            </h2>
            <Link
              to="/admin/visitas"
              className="text-sand text-xs font-montserrat flex items-center gap-1 hover:underline"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-stone-warm/20">
            {data?.upcoming_visits.length === 0 && (
              <p className="px-5 py-8 text-center text-stone-gray font-montserrat text-sm">
                No hay visitas próximas
              </p>
            )}
            {data?.upcoming_visits.map((v) => (
              <div
                key={v.id}
                className="px-5 py-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-montserrat font-medium text-navy text-sm truncate">
                    {v.visitor_name}
                  </p>
                  <p className="font-montserrat text-stone-gray text-xs">
                    {formatDate(v.visit_date)} · {v.time_start}–{v.time_end}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-montserrat px-2 py-0.5 rounded-full ${STATUS_COLORS[v.status] ?? ""}`}
                >
                  {STATUS_LABELS[v.status] ?? v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent contacts */}
        <div className="bg-white rounded-sm border border-stone-warm/30 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-warm/20 flex items-center justify-between">
            <h2 className="font-montserrat font-semibold text-navy text-sm">
              Contactos recientes
            </h2>
            <Link
              to="/admin/contactos"
              className="text-sand text-xs font-montserrat flex items-center gap-1 hover:underline"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-stone-warm/20">
            {data?.recent_contacts.length === 0 && (
              <p className="px-5 py-8 text-center text-stone-gray font-montserrat text-sm">
                Sin contactos aún
              </p>
            )}
            {data?.recent_contacts.map((c) => (
              <div
                key={c.id}
                className="px-5 py-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-montserrat font-medium text-navy text-sm truncate">
                    {c.name}
                  </p>
                  <p className="font-montserrat text-stone-gray text-xs truncate">
                    {c.email}
                  </p>
                  <p className="font-montserrat text-stone-gray text-xs">
                    {formatDateTime(c.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-montserrat px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? ""}`}
                >
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
