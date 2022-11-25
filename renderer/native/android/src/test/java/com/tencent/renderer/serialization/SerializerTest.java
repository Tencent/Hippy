package com.tencent.renderer.serialization;

import static org.junit.Assert.*;

import android.graphics.Color;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import java.util.ArrayList;
import java.util.HashMap;
import org.junit.Test;

public class SerializerTest {

    @Test
    public void writeValue() {
        SafeHeapWriter safeHeapWriter = new SafeHeapWriter();
        Serializer serializer = new Serializer();
        serializer.setWriter(safeHeapWriter);
        serializer.reset();
        serializer.writeHeader();
        HashMap<String, Object> data = new HashMap<>();
        data.put("id", 1);
        data.put("pid", 0);
        data.put("name", "text");
        HashMap<String, Object> style = new HashMap<>();
        style.put("width", 100);
        style.put("height", 100);
        ArrayList<Integer> list = new ArrayList<>();
        list.add(Color.BLUE);
        list.add(Color.RED);

        data.put("style", style);


        serializer.writeValue(snapshot);
    }
}