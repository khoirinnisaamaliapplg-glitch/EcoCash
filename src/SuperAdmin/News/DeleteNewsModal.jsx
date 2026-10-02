import React,{
useState
}
from "react";


import {

Dialog,
DialogHeader,
DialogBody,
DialogFooter,
Button

}
from "@material-tailwind/react";



import {
toast
}
from "react-toastify";


import api from "../../utils/api";




const DeleteNewsModal=({

open,
handleOpen,
news,
refreshData

})=>{


const [loading,setLoading]=useState(false);





const remove=async()=>{


try{


setLoading(true);



await api.delete(

`/superadmin/news/${news.id}`

);



toast.success(
"Berita berhasil dihapus"
);



refreshData();


handleOpen();



}catch(error){


console.log(error);


toast.error(
"Gagal menghapus berita"
);


}

finally{

setLoading(false);

}



};





return (

<Dialog

open={open}

handler={handleOpen}

>


<DialogHeader>

Hapus Berita

</DialogHeader>




<DialogBody>


Apakah Anda yakin ingin menghapus:


<br/>


<strong>

{news?.title}

</strong>


?


</DialogBody>




<DialogFooter>


<Button

variant="text"

onClick={handleOpen}

>

Batal

</Button>



<Button

className="bg-red-600"

loading={loading}

onClick={remove}

>

Hapus

</Button>



</DialogFooter>



</Dialog>


)


}


export default DeleteNewsModal;