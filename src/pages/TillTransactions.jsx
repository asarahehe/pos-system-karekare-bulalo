import { useState, useEffect } from "react";
import TillTransactionsTable from "../components/TillTransactionsTable";

import TablePagination from "@mui/material/TablePagination";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

export default function TillTransactions() {

    const [rows,setRows]=useState([]);
    const [page,setPage]=useState(0);
    const [rowsPerPage,setRowsPerPage]=useState(10);

    useEffect(()=>{

        const fetchTransactions=async()=>{

            const q=query(
                collection(db,"transactions"),
                orderBy("time","desc")
            );

            const snapshot=await getDocs(q);

            const data=snapshot.docs.map(doc=>{

                const t=doc.data();

                const rawDate=t.time?.toDate ? t.time.toDate() : null;

                return{

                    id:t.refID || doc.id,

                    date:rawDate
                        ? rawDate.toLocaleString()
                        : "",

                    status:t.status || "Complete",
                    total:t.total || 0,
                    discountType:t.discountType || null,
                    discountPercent:t.discountPercent || 0,
                    vat:t.vat || 0,
                    payment:t.payment || "Cash",
                    items:(t.items || []).map(item=>({
                        name:item.name,
                        quantity:item.qty || item.quantity || 1,
                        price:item.price || 0
                    }))

                };

            });

            setRows(data);

        };

        fetchTransactions();

    },[]);

    const paginatedRows=rows.slice(
        page*rowsPerPage,
        page*rowsPerPage+rowsPerPage
    );

    return(

        <div className="flex flex-col h-full">

            <div className="flex-1 flex flex-col px-6">

                <div className="px-6 pt-16 relative">

                    {/* HEADER TAB */}

                    <div className="relative">

                        <div className="inline-block bg-white/60 backdrop-blur-lg border border-gray-200 border-b-0 rounded-t-xl px-10 py-4">

                            <div className="flex items-center gap-3 whitespace-nowrap">

<span className="text-2xl font-semibold text-iris-100">
Till Transactions
</span>

                                <span className="text-gray-800 text-lg">››</span>

                                <span className="text-lg text-gray-600">
Live POS transaction feed
</span>

                            </div>

                        </div>

                    </div>

                    {/* TABLE BOX */}

                    <div className="bg-white/95 border border-gray-200 rounded-tr-xl rounded-bl-xl rounded-br-xl px-8 py-5 shadow-sm">

                        <TillTransactionsTable rows={paginatedRows}/>

                    </div>

                    <div className="bg-beige rounded-b-xl h-12 border-t border-gray-100"></div>

                </div>

            </div>

            {/* FOOTER PAGINATION */}

            <div className="sticky bottom-0 bg-beige border-t border-gray-200 flex justify-between items-center px-6 py-1 z-10">

                <div className="text-gray-600 text-sm">

                    Showing {page*rowsPerPage+1}–
                    {Math.min((page+1)*rowsPerPage,rows.length)} of {rows.length}

                </div>

                <TablePagination
                    component="div"
                    count={rows.length}
                    page={page}
                    onPageChange={(e,newPage)=>setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e)=>{
                        setRowsPerPage(parseInt(e.target.value,10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5,10,20]}
                />

            </div>

        </div>

    );

}