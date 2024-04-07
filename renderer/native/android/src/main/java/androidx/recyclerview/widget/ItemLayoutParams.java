package androidx.recyclerview.widget;

import androidx.recyclerview.widget.RecyclerView.LayoutParams;
import com.tencent.renderer.node.ListItemRenderNode;

public interface ItemLayoutParams {

    void getItemLayoutParams(int position, LayoutParams lp);

    void getItemLayoutParams(ListItemRenderNode node, LayoutParams lp);
}
