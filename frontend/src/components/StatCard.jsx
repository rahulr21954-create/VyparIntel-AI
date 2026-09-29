import {
    TrendingUp,
    TrendingDown,
} from "lucide-react";

const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
}) => {
    const isPositive = change >= 0;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                        {value}
                    </h3>
                </div>

                {Icon && (
                    <div className="rounded-xl bg-slate-100 p-3">
                        <Icon
                            size={22}
                            className="text-slate-700"
                        />
                    </div>
                )}
            </div>

            {change !== undefined && (
                <div
                    className={`mt-4 flex items-center gap-1 text-sm ${
                        isPositive
                            ? "text-green-600"
                            : "text-red-600"
                    }`}
                >
                    {isPositive ? (
                        <TrendingUp size={16} />
                    ) : (
                        <TrendingDown size={16} />
                    )}

                    <span>
                        {Math.abs(change).toFixed(1)}%
                    </span>

                    <span className="text-slate-400">
                        vs previous period
                    </span>
                </div>
            )}
        </div>
    );
};

export default StatCard;