import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinaryConfig.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";

const prisma = new PrismaClient();

export const registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      id_number,
      umindanao_email,
      college_department,
      program,
      year_level,
      self_introduction,
      reason_for_joining,
    } = req.body;

    const proof_of_membership_payment =
      req.files.proof_of_membership_payment?.[0]?.path || null;
    const e_signature = req.files.e_signature?.[0]?.path || null;

    const deleteFiles = async () => {
      if (proof_of_membership_payment) {
        fs.unlink(proof_of_membership_payment);
        console.log("Successfully deleted proofOfPayment file");
      }

      if (e_signature) {
        fs.unlink(e_signature);
        console.log("Successfully deleted eSignature file");
      }
    };

    // Check if the id_number already exists in the database
    const existingMember = await prisma.members.findUnique({
      where: { id_number: parseInt(id_number) },
    });

    if (existingMember) {
      deleteFiles();
      return res.status(400).json({
        message: "ID number already exists. Please use a different ID number.",
      });
    }

    if (!proof_of_membership_payment || !e_signature) {
      return res.status(400).json({
        message: "Both proof of payment and e-signature are required.",
      });
    }
    // Assuming memberId is generated after creating the new member
    const member_id = uuidv4();

    // Upload proof of payment to Cloudinary
    const proofOfMembershipPaymentUploadResult =
      await cloudinary.uploader.upload(proof_of_membership_payment, {
        folder: "members_receipt",
        public_id: `receipt_${member_id}`,
        overwrite: true,
        transformation: [{ quality: "auto" }],
      });

    // Upload e-signature to Cloudinary
    const eSignatureUploadResult = await cloudinary.uploader.upload(
      e_signature,
      {
        folder: "members_signatures",
        public_id: `signature_${member_id}`,
        overwrite: true,
        transformation: [{ quality: "auto" }],
      }
    );

    // Save user data along with Cloudinary URLs in the database
    const newUser = await prisma.members.create({
      data: {
        id: member_id,
        first_name,
        last_name,
        id_number: parseInt(id_number),
        umindanao_email,
        college_department,
        program,
        year_level: parseInt(year_level),
        self_introduction,
        reason_for_joining,
        proof_of_membership_payment:
          proofOfMembershipPaymentUploadResult.secure_url, // Store Cloudinary URL
        e_signature: eSignatureUploadResult.secure_url, // Store Cloudinary URL
      },
    });

    deleteFiles();

    res.status(201).json({
      message: "Registration successful!",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during registration." });
    // Safely delete files from the local storage after successful upload
  }
};
