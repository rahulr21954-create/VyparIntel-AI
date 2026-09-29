import {
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

const RiskCard = ({ risks = [] }) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Business Risks
                    </h2>

                    <p className="text-sm text-slate-500">
                        Signals that may need your attention
                    </p>
                </div>

                <AlertTriangle
                    size={22}
                    className="text-orange-500"
                />
            </div>

            <div className="mt-5 space-y-3">
                {risks.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">
                        <CheckCircle2 size={20} />

                        <span className="text-sm">
                            No major risk signals detected.
                        </span>
                    </div>
                ) : (
                    risks.map((risk, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-800">
                                    {risk.type.replaceAll(
                                        "_",
                                        " "
                                    )}
                                </span>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        risk.severity ===
                                        "HIGH"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-yellow-100 text-yellow-700"
                                    }`}
                                >
                                    {risk.severity}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-600">
                                {risk.message}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RiskCard;