import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../integrations/supabase/client';

export const EmployeeImport = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Data Karyawan</CardTitle>
        <CardDescription>
          Silakan gunakan integrasi langsung ke database Supabase untuk data karyawan asli.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Fitur import data dummy sudah dihapus sepenuhnya.</p>
        </div>
      </CardContent>
    </Card>
  );
};
