package com.tencent.mtt.hippy.example;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        findViewById(R.id.open_hermes).setOnClickListener((v) -> {
          Intent i = new Intent(this, MyActivity.class);
          i.putExtra("useHermes", true);
          startActivity(i);
        });
        findViewById(R.id.open_v8).setOnClickListener((v) -> {
            Intent i = new Intent(this, MyActivity.class);
            i.putExtra("useHermes", false);
            startActivity(i);
        });
    }
}
