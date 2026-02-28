import { motion } from "framer-motion";

const Illustration3D = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                className="relative w-96 h-96 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <div className="absolute inset-4 border-4 border-white/20 rounded-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>

                {/* Floating Elements */}
                <motion.div
                    className="absolute -top-12 -right-12 w-24 h-24 bg-pink-500 rounded-xl shadow-lg flex items-center justify-center text-white text-3xl"
                    animate={{
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                    }}
                >
                    💬
                </motion.div>

                <motion.div
                    className="absolute -bottom-8 -left-8 w-20 h-20 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white text-3xl"
                    animate={{
                        y: [0, -25, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                    }}
                >
                    📹
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Illustration3D;
