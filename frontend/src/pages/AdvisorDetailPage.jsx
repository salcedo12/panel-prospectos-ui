import { useMemo, useState } from "react";
import Tabs from "../components/Tabs";
import FiltersBar from "../components/FiltersBar";
import ProspectsTable from "../components/ProspectsTable";
import ProspectModal from "../components/ProspectModal";
import CrmPanel from "../components/CrmPanel";
import XlsxUpload from "../components/XlsxUpload";

import { getProspects, getProspectEvents } from "../services/prospectsService";
import { getCrmContactsByAdvisor } from "../services/crmService";

function cleanSpaces(s) {
  return (s ?? "").toString().replace(/\s+/g, " ").trim();
}

function normalizePhone(p) {
  const s = cleanSpaces(p);

  // Convierte prefijo 00 a +
  const s2 = s.startsWith("00") ? `+${s.slice(2)}` : s;

  const hasPlus = s2.startsWith("+");
  const digits = s2.replace(/[^\d]/g, "");

  return hasPlus ? `+${digits}` : digits;
}
export default function AdvisorDetailPage({ advisor, projects, onBack }) {
  const [tab, setTab] = useState("prospectos");

  const [project, setProject] = useState("LAGUNA");
  const [desde, setDesde] = useState("2026-02-18");
  const [hasta, setHasta] = useState("2026-02-18");

  const [prospects, setProspects] = useState([]);
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [errorProspects, setErrorProspects] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [prospectSel, setProspectSel] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [errorEvents, setErrorEvents] = useState("");

  const [crmLoaded, setCrmLoaded] = useState(false);
  const [crmContacts, setCrmContacts] = useState([]);
  const [crmSheet, setCrmSheet] = useState("");
  const [loadingCrm, setLoadingCrm] = useState(false);
  const [errorCrm, setErrorCrm] = useState("");

  const onBuscar = async () => {
    setLoadingProspects(true);
    setErrorProspects("");
    setProspects([]);

    try {
      const smartList = await getProspects({
        desde,
        advisorName: advisor.name,
        page: 1,
        records: 200,
        project,
        hasta,
      });

      let crmPhones = new Set();
      try {
        const crm = await getCrmContactsByAdvisor(advisor.name);
        const crmRecords = Array.isArray(crm?.records) ? crm.records : [];

        crmPhones = new Set(
          crmRecords
            .map((c) => normalizePhone(c.phone))
            .filter((x) => x && x.length > 6),
        );
      } catch (e) {
        console.log("CRM no cargado aún:", e.message);
      }

      const merged = smartList.map((p) => {
        const pPhone = normalizePhone(p.telefono);
        return {
          ...p,
          enCRM: pPhone && crmPhones.has(pPhone),
        };
      });

      setProspects(merged);
    } catch (e) {
      setErrorProspects(e.message || "Error cargando prospectos");
    } finally {
      setLoadingProspects(false);
    }
  };

  const abrirProspecto = async (p) => {
    setProspectSel(p);
    setModalOpen(true);

    setEvents([]);
    setLoadingEvents(true);
    setErrorEvents("");

    try {
      if (!p.projectCode)
        throw new Error(
          "Prospecto sin projectCode (no puedo consultar eventos).",
        );

      const list = await getProspectEvents({
        prospectId: p.prospectId,
        projectCode: p.projectCode,
      });

      setEvents(list);
    } catch (e) {
      setErrorEvents(e.message || "Error cargando eventos");
    } finally {
      setLoadingEvents(false);
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setProspectSel(null);
    setEvents([]);
    setErrorEvents("");
    setLoadingEvents(false);
  };

  const cargarCrmAsesor = async () => {
    setLoadingCrm(true);
    setErrorCrm("");
    setCrmContacts([]);
    setCrmSheet("");

    try {
      const data = await getCrmContactsByAdvisor(advisor.name);
      setCrmContacts(Array.isArray(data?.records) ? data.records : []);
      setCrmSheet(data?.sheet || "");
    } catch (e) {
      setErrorCrm(e.message || "Error cargando CRM");
    } finally {
      setLoadingCrm(false);
    }
  };

  const smartPhones = useMemo(() => {
    return new Set(
      prospects
        .map((p) => normalizePhone(p.telefono))
        .filter((x) => x && x.length > 6),
    );
  }, [prospects]);

  const crmAdvisor = useMemo(() => {
    return crmContacts
      .map((c) => ({
        name: cleanSpaces(c.name),
        phone: normalizePhone(c.phone),
      }))
      .filter((c) => c.name || c.phone);
  }, [crmContacts]);

  const conSeguimiento = useMemo(
    () => crmAdvisor.filter((c) => c.phone && smartPhones.has(c.phone)),
    [crmAdvisor, smartPhones],
  );

  const sinSeguimiento = useMemo(
    () => crmAdvisor.filter((c) => c.phone && !smartPhones.has(c.phone)),
    [crmAdvisor, smartPhones],
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{advisor.name}</h2>
          <p className="text-sm text-gray-600">
            SmartHome (prospectos + bitácora) y Asimpro (Excel).
          </p>
        </div>

        <button
          onClick={onBack}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Volver
        </button>
      </div>

      <FiltersBar
        projects={projects}
        project={project}
        setProject={setProject}
        desde={desde}
        setDesde={setDesde}
        hasta={hasta}
        setHasta={setHasta}
        onBuscar={onBuscar}
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "prospectos", label: "Prospectos" },
          { value: "crm", label: "Asimpro (Excel)" },
        ]}
      />

      {tab === "prospectos" ? (
        <>
          {loadingProspects ? (
            <p className="text-gray-600 mb-3">Cargando prospectos...</p>
          ) : null}
          {errorProspects ? (
            <p className="text-red-600 mb-3">{errorProspects}</p>
          ) : null}

          <ProspectsTable prospects={prospects} onClickRow={abrirProspecto} />

          <ProspectModal
            open={modalOpen}
            prospect={
              prospectSel
                ? {
                    Cliente: prospectSel.cliente,
                    Telefono: prospectSel.telefono,
                    Probabilidad: prospectSel.probabilidad,
                    ProspectId: prospectSel.prospectId,
                  }
                : null
            }
            events={events.map((e) => ({
              fecha: e.fecha,
              asesor: e.asesor,
              nota: e.accion ? `[${e.accion}] ${e.nota}` : e.nota,
            }))}
            onClose={cerrarModal}
          />

          {modalOpen ? (
            <div className="mt-2">
              {loadingEvents ? (
                <p className="text-gray-600">Cargando eventos...</p>
              ) : null}
              {errorEvents ? (
                <p className="text-red-600">{errorEvents}</p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <XlsxUpload
            onUploaded={() => {
              setCrmLoaded(true);
              cargarCrmAsesor();
            }}
          />

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={cargarCrmAsesor}
              disabled={!crmLoaded || loadingCrm}
              className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loadingCrm ? "Cargando..." : "Cargar contactos del asesor"}
            </button>

            {crmLoaded ? (
              <p className="text-sm text-gray-700">
                Contactos cargados: {crmContacts.length}{" "}
                {crmSheet ? `(hoja: ${crmSheet})` : ""}
              </p>
            ) : (
              <p className="text-sm text-gray-700">Primero sube el Excel.</p>
            )}
          </div>

          <CrmPanel
            conSeguimiento={conSeguimiento}
            sinSeguimiento={sinSeguimiento}
            loading={loadingCrm}
            error={errorCrm}
            sheet={crmSheet}
          />
        </>
      )}
    </>
  );
}
