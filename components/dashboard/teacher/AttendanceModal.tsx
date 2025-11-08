import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../../types';
import { X, CheckCircle } from 'lucide-react';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface AttendanceModalProps {
  onClose: () => void;
  students: User[];
  onSubmit: (attendanceData: Record<string, AttendanceStatus>) => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ onClose, students, onSubmit }) => {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    // Initialize all students as 'present' by default when the component mounts
    const initialAttendance = students.reduce((acc, student) => {
      acc[student.id] = 'present';
      return acc;
    }, {} as Record<string, AttendanceStatus>);
    setAttendance(initialAttendance);
  }, [students]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    onSubmit(attendance);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-lg bg-brand-light-blue rounded-2xl border border-white/10 shadow-2xl shadow-brand-neon-purple/30 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <CheckCircle />
              <span>Take Attendance</span>
            </h2>
            <button onClick={onClose} className="p-1 rounded-full text-brand-silver-gray hover:bg-white/10 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-brand-silver-gray mt-1">Mark the status for each student for today's class.</p>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
              <span className="text-white">{student.name}</span>
              <div className="flex space-x-2">
                <StatusButton status="present" currentStatus={attendance[student.id]} onClick={handleStatusChange} studentId={student.id} />
                <StatusButton status="absent" currentStatus={attendance[student.id]} onClick={handleStatusChange} studentId={student.id} />
                <StatusButton status="late" currentStatus={attendance[student.id]} onClick={handleStatusChange} studentId={student.id} />
              </div>
            </div>
          ))}
          {students.length === 0 && <p className="text-center text-brand-silver-gray py-4">No students to mark attendance for.</p>}
        </div>

        <div className="p-6 border-t border-white/10 mt-auto">
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-3 rounded-lg text-white font-semibold bg-brand-neon-purple hover:bg-opacity-80 transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
            disabled={students.length === 0}
          >
            Submit Attendance
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatusButton: React.FC<{
  status: AttendanceStatus;
  currentStatus: AttendanceStatus;
  studentId: string;
  onClick: (studentId: string, status: AttendanceStatus) => void;
}> = ({ status, currentStatus, studentId, onClick }) => {
  const isSelected = status === currentStatus;
  const colors = {
    present: 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/40',
    absent: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/40',
    late: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/40',
  };
  const selectedColors = {
    present: 'bg-green-500 text-white border-green-400',
    absent: 'bg-red-500 text-white border-red-400',
    late: 'bg-yellow-500 text-white border-yellow-400',
  };

  return (
    <button
      onClick={() => onClick(studentId, status)}
      className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors capitalize ${isSelected ? selectedColors[status] : colors[status]}`}
    >
      {status}
    </button>
  );
};

export default AttendanceModal;