import {
    AlertTriangle,
    Brain,
    Loader2,
    RefreshCw,
} from "lucide-react";

const AIEngineState = ({
    type = "loading",
    title,
    message,
    onRetry,
}) => {
    if (type === "loading") {
        return (
            <div className="rounded-3xl border border-emerald-900/50 bg-[#0B1712] p-10 text-center">

                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">

                    <Loader2
                        size={28}
                        className="animate-spin text-emerald-400"
                    />

                </div>

                <h3 className="text-lg font-semibold text-white">
                    {title || "Analyzing your business"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    {message ||
                        "VyparMind is analyzing your latest business data."}
                </p>

            </div>
        );
    }

    if (type === "error") {
        return (
            <div className="rounded-3xl border border-red-900/50 bg-[#0B1712] p-10 text-center">

                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">

                    <AlertTriangle
                        size={27}
                        className="text-red-400"
                    />

                </div>

                <h3 className="text-lg font-semibold text-white">
                    {title || "AI Engine unavailable"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    {message ||
                        "VyparMind could not generate this analysis right now."}
                </p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="
                            mt-6
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-emerald-500
                            px-5 py-2.5
                            text-sm
                            font-semibold
                            text-[#06100B]
                            transition
                            hover:bg-emerald-400
                        "
                    >
                        <RefreshCw size={16} />

                        Try Again
                    </button>
                )}

            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-emerald-900/50 bg-[#0B1712] p-10 text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">

                <Brain
                    size={27}
                    className="text-emerald-400"
                />

            </div>

            <h3 className="text-lg font-semibold text-white">
                {title || "No AI insight available"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {message ||
                    "There is not enough information to generate an insight yet."}
            </p>

        </div>
    );
};

export default AIEngineState;