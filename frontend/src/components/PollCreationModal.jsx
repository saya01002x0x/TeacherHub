import { useState } from "react";
import { XIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";

const PollCreationModal = ({ onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddOption = () => {
        setOptions([...options, ""]);
    };

    const handleRemoveOption = (index) => {
        if (options.length <= 2) return;
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;
        if (options.some((opt) => !opt.trim())) return;

        setIsLoading(true);
        try {
            await onSubmit({
                name: question,
                options: options.map((text) => ({ text })),
                voting_visibility: "public", // Valid values: "anonymous" or "public"
                max_votes_allowed: allowMultipleAnswers ? options.length : 1,
                allow_user_suggest: false,
                allow_answers: true,
            });
            onClose();
        } catch (error) {
            console.error("Error creating poll:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">{t("poll.create_title")}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* QUESTION */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("poll.question_label")}
                            </label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={t("poll.question_placeholder")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                        </div>

                        {/* OPTIONS */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                {t("poll.options_label")}
                            </label>
                            {options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`${t("poll.option_placeholder")} ${index + 1}`}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        required
                                    />
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(index)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2Icon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddOption}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                                <PlusIcon className="w-4 h-4" />
                                {t("poll.add_option")}
                            </button>
                        </div>

                        {/* SETTINGS */}
                        <div className="pt-2 border-t border-gray-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allowMultipleAnswers}
                                    onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
                                    className="checkbox checkbox-sm checkbox-primary rounded-md"
                                />
                                <span className="text-sm text-gray-700">{t("poll.allow_multiple")}</span>
                            </label>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                disabled={isLoading}
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium disabled:opacity-70 flex items-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? t("poll.creating") : t("poll.create_button")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PollCreationModal;
