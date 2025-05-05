import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import BarOverviewChart from "./elementOverview/BarOverviewChart";
import LineOverviewChart from "./elementOverview/LineOverviewChart";
import PieOverviewChart  from "./elementOverview/PieOverviewChart ";
import Header from "./comon/Header";
import AdminTable from "./elementOverview/AdminTable";
const OverviewPage = () => {
	return (
		<div className="flex-1 w-full relative z-10">
			<Header title="Overview" />

			<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
				{/* STATS */}
				<motion.div
					className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<motion.div
						className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
						whileHover={{
							y: -5,
							boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
						}}
					>
						<div className="px-4 py-5 sm:p-6">
							<span className="flex items-center text-sm font-medium text-gray-400">
								<BarChart2 size={20} className="mr-2" />
                                Total Sales
							</span>
							<p className="mt-1 text-3xl font-semibold text-gray-100">
								$1000
							</p>
						</div>
					</motion.div>
					<motion.div
						className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
						whileHover={{
							y: -5,
							boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
						}}
					>
						<div className="px-4 py-5 sm:p-6">
							<span className="flex items-center text-sm font-medium text-gray-400">
								<BarChart2 size={20} className="mr-2" />
                                New Users
							</span>
							<p className="mt-1 text-3xl font-semibold text-gray-100">
								1000
							</p>
						</div>
					</motion.div>
					<motion.div
						className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
						whileHover={{
							y: -5,
							boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
						}}
					>
						<div className="px-4 py-5 sm:p-6">
							<span className="flex items-center text-sm font-medium text-gray-400">
								<BarChart2 size={20} className="mr-2" />
                                 Products
							</span>
							<p className="mt-1 text-3xl font-semibold text-gray-100">
								1000
							</p>
						</div>
					</motion.div>
					<motion.div
						className="bg-gray-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
						whileHover={{
							y: -5,
							boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
						}}
					>
						<div className="px-4 py-5 sm:p-6">
							<span className="flex items-center text-sm font-medium text-gray-400">
								<BarChart2 size={20} className="mr-2" />
                                Conversiton Rate
							</span>
							<p className="mt-1 text-3xl font-semibold text-gray-100">
								90%
							</p>
						</div>
					</motion.div>
				</motion.div>

				{/* CHARTS */}
						
						<AdminTable/>
						
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					<LineOverviewChart />
					<PieOverviewChart  />
					<BarOverviewChart />
				</div>
			</main>
		</div>
	);
};

export default OverviewPage;
