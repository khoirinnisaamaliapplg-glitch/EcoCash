import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const CreateModal = ({ open, handleOpen }) => {
  return (
    <Dialog 
      open={open} 
      handler={handleOpen} 
      size="sm" 
      className="rounded-3xl shadow-2xl"
    >
      <div className="flex items-center justify-between pr-4">
        <DialogHeader className="text-[#2b6cb0] font-black text-xl">
          Create New Container
        </DialogHeader>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen}>
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </div>

      <DialogBody className="px-6 pb-6 space-y-4 text-blue-gray-700">
        <div>
          <Typography variant="small" className="font-bold text-blue-900 mb-2">
            Container ID
          </Typography>
          <Input placeholder="Ex: 003" labelProps={{ className: "hidden" }} className="!border-t-blue-gray-200 focus:!border-blue-500" />
        </div>
        
        <div>
          <Typography variant="small" className="font-bold text-blue-900 mb-2">
            Location Name
          </Typography>
          <Input placeholder="Ex: Tasikmalaya" labelProps={{ className: "hidden" }} className="!border-t-blue-gray-200 focus:!border-blue-500" />
        </div>

      </DialogBody>

      <DialogFooter className="space-x-2 border-t border-gray-50">
        <Button variant="text" color="red" onClick={handleOpen} className="normal-case">
          Cancel
        </Button>
        <Button className="bg-[#4CAF50] normal-case px-8 shadow-none" onClick={handleOpen}>
          Create Now
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;