import { Link } from "react-router-dom";

export default function AccessDenied() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-beige px-6">
            <div className="max-w-md w-full rounded-2xl bg-white shadow-xl p-8 text-center">
                <div className="text-5xl mb-4">🚫</div>
                <h1 className="text-2xl font-semibold text-gray-800">Access Denied</h1>
                <p className="mt-3 text-sm text-gray-600">
                    You do not have permission to view this page.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    <Link
                        to="/till"
                        className="px-4 py-2 rounded-lg bg-iris-80 text-white hover:bg-iris-60 transition"
                    >
                        Go to POS
                    </Link>
                    <Link
                        to="/login"
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
