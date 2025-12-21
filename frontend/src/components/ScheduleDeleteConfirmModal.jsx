import { XIcon, AlertTriangleIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const ScheduleDeleteConfirmModal = ({ schedule, onConfirm, onCancel, isLoading }) => {
    const { t } = useTranslation();

    if (!schedule) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-red-50">
                    <div className="flex items-center gap-2">
                        <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                        <h2 className="text-lg font-semibold text-red-800">
                            {t("schedule.delete_confirm_title")}
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors"
                        disabled={isLoading}
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-700 mb-2">
                        {t("schedule.delete_confirm_message")}
                    </p>
                    <p className="text-gray-900 font-medium bg-gray-100 p-3 rounded-lg">
                        {schedule.title}
                    </p>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
                        disabled={isLoading}
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium disabled:opacity-70"
                        disabled={isLoading}
                    >
                        {isLoading ? t("common.deleting") || "削除中..." : t("schedule.delete_button")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDeleteConfirmModal;
